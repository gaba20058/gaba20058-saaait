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
        
        if (pageName === 'chat') {
            loadChats();
        }
    } else {
        console.error('Страница не найдена:', pageName + '-page');
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
    const heroButtons = document.getElementById('hero-buttons');

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
        
        if (heroButtons) {
            heroButtons.style.display = 'none';
        }
    } else {
        console.log('Пользователь не авторизован');
        
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
        navButtons.classList.remove('active');
        userName.textContent = '';
        
        if (heroButtons) {
            heroButtons.style.display = 'flex';
        }
    }
}

let currentChatId = null;
let allUsers = [];

function openChatModal() {
    document.getElementById('chatModal').style.display = 'flex';
    loadUsersForChat();
}

function closeChatModal(event) {
    if (event && event.target.classList.contains('modal-overlay')) {
        document.getElementById('chatModal').style.display = 'none';
    } else {
        document.getElementById('chatModal').style.display = 'none';
    }
    document.getElementById('chatName').value = '';
    document.getElementById('userSearch').value = '';
}

async function loadUsersForChat() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load users');
        allUsers = await response.json();
        
        displayUsers(allUsers);
    } catch (error) {
        showMessage('Ошибка загрузки пользователей', 'error');
        document.getElementById('usersList').innerHTML = '<div class="loading-users">Ошибка загрузки</div>';
    }
}

function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    if (users.length === 0) {
        usersList.innerHTML = '<div class="loading-users">Нет других пользователей</div>';
        return;
    }
    
    usersList.innerHTML = users.map(user => `
        <div class="user-item" onclick="toggleUser(this, ${user.id})">
            <input type="checkbox" value="${user.id}">
            <span>${user.username}</span>
            <small style="color: #999; margin-left: auto;">${user.email}</small>
        </div>
    `).join('');
}

function filterUsers() {
    const searchText = document.getElementById('userSearch').value.toLowerCase();
    const filtered = allUsers.filter(user => 
        user.username.toLowerCase().includes(searchText) || 
        user.email.toLowerCase().includes(searchText)
    );
    displayUsers(filtered);
}

function toggleUser(element, userId) {
    const checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    element.classList.toggle('selected');
}

async function createChat() {
    const chatName = document.getElementById('chatName').value;
    const selectedUsers = Array.from(document.querySelectorAll('#usersList input:checked')).map(cb => cb.value);
    
    if (!chatName) {
        showMessage('Введите название чата', 'error');
        return;
    }
    
    if (selectedUsers.length === 0) {
        showMessage('Выберите хотя бы одного участника', 'error');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/chats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: chatName,
                participants: selectedUsers
            })
        });
        
        if (response.ok) {
            showMessage('Чат создан!', 'success');
            closeChatModal();
            loadChats();
        } else {
            const data = await response.json();
            showMessage(data.error || 'Ошибка создания чата', 'error');
        }
    } catch (error) {
        showMessage('Ошибка соединения с сервером', 'error');
    }
}

async function loadChats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/chats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load chats');
        const chats = await response.json();
        
        const chatList = document.getElementById('chatList');
        if (!chatList) return;
        
        if (chats.length === 0) {
            chatList.innerHTML = '<div class="chat-item"><div class="chat-info"><p>У вас нет чатов</p></div></div>';
            return;
        }
        
        const currentUser = JSON.parse(localStorage.getItem('user'));
        
        chatList.innerHTML = chats.map(chat => {
            const otherUsers = chat.participants
                .filter(p => p.user.id !== currentUser.id)
                .map(p => p.user.username)
                .join(', ');
            
            const lastMessage = chat.messages[0]?.content || 'Нет сообщений';
            const isActive = currentChatId === chat.id ? 'active' : '';
            
            return `
                <div class="chat-item ${isActive}" onclick="selectChat(${chat.id})">
                    <div class="chat-info">
                        <h4>${chat.name}</h4>
                        <p>${otherUsers}</p>
                        <small>${lastMessage.substring(0, 30)}${lastMessage.length > 30 ? '...' : ''}</small>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading chats:', error);
    }
}

function filterChats() {
    const searchText = document.getElementById('chatSearch').value.toLowerCase();
    const chatItems = document.querySelectorAll('.chat-item');
    
    chatItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchText)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

async function selectChat(chatId) {
    currentChatId = chatId;
    
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/chats/${chatId}/messages`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load messages');
        const messages = await response.json();
        
        const chatsResponse = await fetch('/api/chats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const chats = await chatsResponse.json();
        const currentChat = chats.find(c => c.id === chatId);
        
        const chatHeader = document.getElementById('chatHeader');
        const currentUser = JSON.parse(localStorage.getItem('user'));
        
        if (currentChat) {
            const otherUsers = currentChat.participants
                .filter(p => p.user.id !== currentUser.id)
                .map(p => p.user.username)
                .join(', ');
            chatHeader.innerHTML = `<h3>${currentChat.name} (${otherUsers})</h3>`;
        }
        
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = messages.map(msg => {
            const isSent = msg.senderId === currentUser.id;
            const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return `
                <div class="message-item ${isSent ? 'sent' : 'received'}">
                    ${!isSent ? `<small>${msg.sender.username}</small>` : ''}
                    <div>${msg.content}</div>
                    <small style="font-size: 0.6rem; opacity: 0.7;">${time}</small>
                </div>
            `;
        }).join('');
        
        document.getElementById('chatInputArea').style.display = 'flex';
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    
    if (!content || !currentChatId) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/chats/${currentChatId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });
        
        if (!response.ok) throw new Error('Failed to send message');
        
        const message = await response.json();
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-item sent';
        messageDiv.innerHTML = `
            <div>${message.content}</div>
            <small style="font-size: 0.6rem; opacity: 0.7;">${time}</small>
        `;
        messagesContainer.appendChild(messageDiv);
        
        input.value = '';
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        loadChats();
    } catch (error) {
        showMessage('Ошибка отправки сообщения', 'error');
    }
}

window.showPage = showPage;
window.logout = logout;
window.register = register;
window.login = login;
window.openChatModal = openChatModal;
window.closeChatModal = closeChatModal;
window.toggleUser = toggleUser;
window.filterUsers = filterUsers;
window.createChat = createChat;
window.selectChat = selectChat;
window.sendMessage = sendMessage;
window.filterChats = filterChats;

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