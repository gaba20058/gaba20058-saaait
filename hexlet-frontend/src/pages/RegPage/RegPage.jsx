import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateUsername, validateEmail, validatePassword } from '../../utils/validation';
import './RegPage.css';

const RegPage = ({ showNotification }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateUsername(formData.username) || 
                  validateEmail(formData.email) || 
                  validatePassword(formData.password);
    
    if (error) {
      showNotification(error, 'error');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Регистрация успешна!', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        showNotification(data.error || 'Ошибка регистрации', 'error');
      }
    } catch (err) {
      showNotification('Ошибка соединения с сервером', 'error');
    }
  };

  return (
    <main className="main-content">
      <div className="container">
        <div className="form-container">
          <h2>Регистрация</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Имя пользователя</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                placeholder="Только русские буквы" 
                required 
              />
            </div>
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
                minLength="6" 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Зарегистрироваться
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default RegPage;
