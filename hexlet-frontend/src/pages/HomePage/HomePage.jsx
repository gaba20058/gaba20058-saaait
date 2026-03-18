import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = ({ user }) => {
  return (
    <main className="main-content">
      <div className="container">
        <div className="hero">
          <h1>Добро пожаловать в АндрейГрам</h1>
          <p>Простая и безопасная аутентификация для ваших проектов</p>
          
          {!user && (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-large">Начать сейчас</Link>
              <Link to="/login" className="btn btn-outline btn-large">Войти</Link>
            </div>
          )}
        </div>
        
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Безопасность</h3>
            <p>JWT токены и bcrypt хеширование паролей</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Быстрота</h3>
            <p>Мгновенная передача сообщений</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Адаптивность</h3>
            <p>Работает на всех устройствах</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
