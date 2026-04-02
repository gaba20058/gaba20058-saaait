import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './pages/components/Header';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegPage from './pages/RegPage/RegPage';
import ChatPage from './pages/ChatPage/ChatPage';
import PostPage from './pages/PostPage/PostPage';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState({ text: '', type: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const showNotification = (text, type) => {
    setNotification({ text, type });
    setTimeout(() => setNotification({ text: '', type: '' }), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    showNotification('Выход выполнен успешно', 'success');
  };

  return (
    <Router>
      <div className="app-wrapper">
        <Header user={user} onLogout={handleLogout} />

        {notification.text && (
          <div className={`message ${notification.type}`} style={{ display: 'block' }}>
            {notification.text}
          </div>
        )}

        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          
          <Route path="/login" element={
            <LoginPage onLogin={setUser} showNotification={showNotification} />
          } />
          
          <Route path="/register" element={
            <RegPage showNotification={showNotification} />
          } />

          <Route path="/posts" element={
            <PostPage showNotification={showNotification} />
          } />

          <Route path="/chat" element={
            <ChatPage user={user} showNotification={showNotification} />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;