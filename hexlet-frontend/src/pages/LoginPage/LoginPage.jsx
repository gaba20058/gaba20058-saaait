import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validatePassword } from '../../utils/validation';
import './LoginPage.css';

const LoginPage = ({ onLogin, showNotification }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const error = validateEmail(formData.email) || validatePassword(formData.password);
    if (error) {
      showNotification(error, 'error');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        onLogin(data.user);

        showNotification('Вход выполнен успешно!', 'success');

        setTimeout(() => {
          navigate('/chat');
        }, 1500);
      } else {
        showNotification(data.error || 'Ошибка входа', 'error');
      }
    } catch (err) {
      showNotification('Ошибка соединения с сервером', 'error');
    }
  };

  return (
    <main className="main-content">
      <div className="container">
        <div className="form-container">
          <h2>Вход</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Войти</button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
