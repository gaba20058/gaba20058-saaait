const API_URL = '/api/auth';

function validateUsername(username) {
    const regex = /^[А-Яа-яЁё]+$/;
    if (!username) return 'Имя обязательно';
    if (!regex.test(username)) return 'Имя может содержать только русские буквы';
    if (username.length < 2) return 'Имя должно быть не менее 2 букв';
    return '';
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email обязателен';
    if (!regex.test(email)) return 'Введите корректный email';
    return '';
}

function validatePassword(password) {
    if (!password) return 'Пароль обязателен';
    if (password.length < 6) return 'Пароль должен быть не менее 6 символов';
    return '';
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

async function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('reg-username')?.value;
    const email = document.getElementById('reg-email')?.value;
    const password = document.getElementById('reg-password')?.value;
    
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (usernameError || emailError || passwordError) {
        showMessage(usernameError || emailError || passwordError, 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Регистрация успешна!', 'success');
            setTimeout(() => {
                showPage('login');
            }, 2000);
        } else {
            showMessage(data.error || 'Ошибка регистрации', 'error');
        }
    } catch (error) {
        showMessage('Ошибка соединения с сервером', 'error');
    }
}

async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;
    
    if (!email || !password) {
        showMessage('Заполните все поля', 'error');
        return;
    }
    
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (emailError || passwordError) {
        showMessage(emailError || passwordError, 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token); 
            localStorage.setItem('user', JSON.stringify(data.user));

            showMessage('Вход выполнен успешно!', 'success');
            
            setTimeout(() => {
                checkAuth();
                showPage('chat');
            }, 1000);
        } else {
            showMessage(data.error || 'Ошибка входа', 'error');
        }
    } catch (error) {
        showMessage('Ошибка соединения с сервером', 'error');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    checkAuth();
    showPage('home');
    showMessage('Выход выполнен успешно', 'success');
}

function showPage(pageName) {
    console.log('Переход на страницу:', pageName);
    
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const target = document.getElementById(pageName + '-page');
    if (target) {
        target.classList.add('active');
        console.log('Страница найдена:', pageName + '-page');
    } else {
        console.error('Страница не найдена:', pageName + '-page');
        const altTarget = document.getElementById(pageName);
        if (altTarget) {
            altTarget.classList.add('active');
            console.log('Найдена альтернативная страница:', pageName);
        }
    }
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    if (input.value.trim()) {
        const messages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-item sent';
        messageDiv.textContent = input.value;
        messages.appendChild(messageDiv);
        input.value = '';
        messages.scrollTop = messages.scrollHeight;
    }
}

function checkAuth() {
    console.log('Проверка авторизации...');
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    const navButtons = document.getElementById('nav-buttons');

    if (!authButtons || !userMenu || !userName || !navButtons) {
        console.error('Не найдены элементы интерфейса');
        return;
    }

    if (token && user) {
        console.log('Пользователь авторизован:', user.username);
        
        authButtons.style.display = 'none';
        userMenu.style.display = 'flex';
        navButtons.classList.add('active');
        userName.textContent = user.username;
    } else {
        console.log('Пользователь не авторизован');
        
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
        navButtons.classList.remove('active');
        userName.textContent = '';
    }
}

window.showPage = showPage;
window.logout = logout;
window.sendMessage = sendMessage;
window.register = register;
window.login = login;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');
    
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', register);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }
    
    checkAuth();
});