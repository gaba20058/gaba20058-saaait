import React, { useState, useEffect } from 'react';
import './ChatPage.css';

const ChatPage = ({ showNotification }) => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatName, setChatName] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const getParticipantWord = (count) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'участников';
    if (lastDigit === 1) return 'участник';
    if (lastDigit >= 2 && lastDigit <= 4) return 'участника';
    return 'участников';
  };

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setChats(await response.json());
    } catch (error) { console.error(error); }
  };

  useEffect(() => { loadChats(); }, []);

  const handleSelectChat = async (chat) => {
    setCurrentChat(chat);
    try {
      const response = await fetch(`/api/chats/${chat.id}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setMessages(await response.json());
    } catch (error) { console.error(error); }
  };

const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!messageText.trim() || !currentChat) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/chats/${currentChat.id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content: messageText })
    });

    if (response.ok) {
      const newMessage = await response.json();
      
      setMessages([...messages, newMessage]); 
      setMessageText(''); 

      setChats(prevChats => prevChats.map(chat => 
        chat.id === currentChat.id 
          ? { ...chat, lastMessage: newMessage } 
          : chat
      ));
    }
  } catch (error) {
    console.error('Ошибка отправки:', error);
  }
};

  const openChatModal = async () => {
    setIsModalOpen(true);
    try {
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setAllUsers(await response.json());
    } catch (error) { console.error(error); }
  };

  const closeChatModal = () => { setIsModalOpen(false); setChatName(''); setSelectedUserIds([]); };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handleCreateChat = async () => {
    if (!chatName.trim() || selectedUserIds.length === 0) return;
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: chatName, participants: selectedUserIds })
      });
      if (response.ok) {
        closeChatModal();
        loadChats();
      }
    } catch (error) { console.error(error); }
  };

  const openDeleteModal = (e, chat) => {
    e.stopPropagation();
    console.log("Выбран чат для удаления:", chat);
    setChatToDelete(chat); 
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteChat = async () => {
    if (!chatToDelete || !chatToDelete.id) {
      showNotification('Ошибка: чат не выбран', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chats/${chatToDelete.id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.ok) {
        showNotification('Чат удален', 'success');
        
        if (currentChat?.id === chatToDelete.id) {
          setCurrentChat(null);
          setMessages([]);
        }
        
        loadChats();
        setIsDeleteModalOpen(false);
        setChatToDelete(null);
      } else {
        showNotification('Не удалось удалить чат', 'error');
      }
    } catch (error) {
      console.error(error);
      showNotification('Ошибка соединения', 'error');
    }
  };


  return (
    <main id="chat-page">
      <div className="chat-layout">
        <aside className="chat-sidebar">
          <div className="chat-search">
            <input type="text" placeholder="Поиск чатов..." />
          </div>
          <div className="create-chat-btn" onClick={openChatModal}>+ Создать чат</div>
<div className="chat-list">
  {chats.map(chat => (
    <div 
      key={chat.id} 
      className={`chat-item ${currentChat?.id === chat.id ? 'active' : ''}`}
      onClick={() => handleSelectChat(chat)}
      style={{ position: 'relative' }}
    >
      <div className="chat-info">
        <h4>{chat.name}</h4>
        <p className="chat-participants">
          {chat.participants?.map(p => p.user?.username).join(', ')}
        </p>
        <small className="chat-status">
           {chat.lastMessage?.content || (chat.messages && chat.messages[chat.messages.length - 1]?.content) || 'Нет сообщений'}
        </small>
        <button 
  className="delete-chat-btn" 
  onClick={(e) => openDeleteModal(e, chat)}
>
  ✕
</button>

      </div>

<button 
  className="delete-chat-btn" 
  onClick={(e) => openDeleteModal(e, chat)}
>
  ✕
</button>
    </div>
  ))}
</div>

        </aside>

        <section className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <h3>{currentChat ? currentChat.name : 'Выберите чат'}</h3>
              {currentChat && (
                <small className="chat-header-status">
                  {currentChat.participants?.length || 0} {getParticipantWord(currentChat.participants?.length || 0)}
                </small>
              )}
            </div>
          </div>
          
          <div className="chat-messages">
            {currentChat ? (
              messages.map((msg, idx) => {
                const isSent = msg.senderId === currentUser.id;
                return (
                  <div key={idx} className={`message-item ${isSent ? 'sent' : 'received'}`}>
                    {!isSent && <small className="sender-name">{msg.sender?.username}</small>}
                    <div className="message-content">{msg.content}</div>
                  </div>
                );
              })
            ) : (
              <div className="empty-chat">
                <p>Выберите чат для начала общения</p>
              </div>
            )}
          </div>

          {currentChat && (
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                value={messageText} 
                onChange={(e) => setMessageText(e.target.value)} 
                placeholder="Сообщение..." 
              />
              <button type="submit" className="btn btn-primary">Отправить</button>
            </form>
          )}
        </section>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeChatModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Создать чат</h3>
              <button className="modal-close" onClick={closeChatModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Название</label>
                <input 
                  type="text" 
                  value={chatName} 
                  onChange={e => setChatName(e.target.value)} 
                  placeholder="Введите название" 
                  className="user-search"
                />
              </div>
              <div className="form-group">
                <label>Участники</label>
                <input 
                  type="text" 
                  className="user-search" 
                  placeholder="Поиск..." 
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
                <div className="users-list">
                  {allUsers.filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase())).map(user => (
                    <div 
                      key={user.id} 
                      className={`user-item ${selectedUserIds.includes(user.id) ? 'selected' : ''}`} 
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      <input type="checkbox" checked={selectedUserIds.includes(user.id)} readOnly />
                      <span>{user.username}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary btn-block" onClick={handleCreateChat} style={{marginTop: '15px'}}>
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

{isDeleteModalOpen && (
  <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '400px', textAlign: 'center'}}>
      <div className="modal-header">
        <h3>Удаление чата</h3>
        <button className="modal-close" onClick={() => setIsDeleteModalOpen(false)}>✕</button>
      </div>
      <div className="modal-body">
        <p style={{marginBottom: '20px', fontSize: '1.1rem'}}>
          Вы уверены, что хотите удалить чат <strong>{chatToDelete?.name}</strong>?
        </p>
        <div style={{display: 'flex', gap: '15px', justifyContent: 'center'}}>
          <button className="btn btn-outline" onClick={() => setIsDeleteModalOpen(false)}>Отмена</button>
          <button className="btn" style={{backgroundColor: '#e53e3e', color: 'white'}} onClick={confirmDeleteChat}>Да, удалить</button>
        </div>
      </div>
    </div>
  </div>
)}

    </main>
  );
};

export default ChatPage;
