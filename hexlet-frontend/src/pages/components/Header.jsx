import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>Андрей<span>Грам</span></h1>
        </Link>
        
        {user && (
          <div className="nav-buttons">
            <Link to="/chat" className="btn btn-outline">Чаты</Link>
            <Link to="/posts" className="btn btn-outline">Посты</Link>
          </div>
        )}

        <div className="user-section">
          {user ? (
            <div className="user-menu">
              <span className="user-name">{user.username}</span>
              <button className="btn btn-outline" onClick={handleLogoutClick}>Выход</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Вход</Link>
              <Link to="/register" className="btn btn-primary">Регистрация</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
