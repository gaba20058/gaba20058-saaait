const API_URL = '/api/auth';

// Валидация
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

// Показать сообщение
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) {
        console.error('Message div not found');
        return;
    }
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    console.log(`Message: ${text} (${type})`);
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// Регистрация
async function register() {
    // Очищаем ошибки
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('input').forEach(el => el.classList.remove('error'));
    
    const username = document.getElementById('reg-username')?.value;
    const email = document.getElementById('reg-email')?.value;
    const password = document.getElementById('reg-password')?.value;
    
    // Валидация
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (usernameError || emailError || passwordError) {
        if (usernameError) {
            document.getElementById('username-error').textContent = usernameError;
            document.getElementById('reg-username').classList.add('error');
        }
        if (emailError) {
            document.getElementById('email-error').textContent = emailError;
            document.getElementById('reg-email').classList.add('error');
        }
        if (passwordError) {
            document.getElementById('password-error').textContent = passwordError;
            document.getElementById('reg-password').classList.add('error');
        }
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
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showMessage(data.error || 'Ошибка регистрации', 'error');
        }
    } catch (error) {
        showMessage('Ошибка соединения с сервером', 'error');
    }
}

// Вход
async function login() {
    console.log('Login function called');
    
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('input').forEach(el => el.classList.remove('error'));
    
    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;
    
    if (!email || !password) {
        showMessage('Заполните все поля', 'error');
        return;
    }
    
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (emailError || passwordError) {
        if (emailError) {
            document.getElementById('login-email-error').textContent = emailError;
            document.getElementById('login-email').classList.add('error');
        }
        if (passwordError) {
            document.getElementById('login-password-error').textContent = passwordError;
            document.getElementById('login-password').classList.add('error');
        }
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
            showMessage('Вход выполнен успешно!', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showMessage(data.error || 'Ошибка входа', 'error');
        }
    } catch (error) {
        showMessage('Ошибка соединения с сервером', 'error');
    }
}

// Выход
async function logout() {
    try {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            showMessage('Выход выполнен успешно', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    } catch (error) {
        showMessage('Ошибка при выходе', 'error');
    }
}

// Проверка авторизации
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/me`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            const authButtons = document.getElementById('auth-buttons');
            const userMenu = document.getElementById('user-menu');
            const userName = document.getElementById('user-name');
            
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                if (userName) userName.textContent = data.user.username;
            }
        }
    } catch (error) {
        console.log('Not authenticated');
    }
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', checkAuth);