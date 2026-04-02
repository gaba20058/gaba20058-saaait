import React, { useState, useEffect } from 'react';
import './PostPage.css';

const PostPage = () => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Ошибка загрузки ленты:", err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // --- ЛОГИКА ЛАЙКОВ ---
  const handleLike = async (postId) => {
    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      loadPosts(); // Обновляем ленту, чтобы увидеть лайк
    } catch (err) {
      console.error("Ошибка лайка:", err);
    }
  };

  // --- ЛОГИКА КОММЕНТАРИЕВ ---
  const handleCreateComment = async (postId, content) => {
    try {
      await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, authorId: user.id })
      });
      loadPosts(); // Обновляем ленту, чтобы увидеть коммент
    } catch (err) {
      console.error("Ошибка комментария:", err);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Новая запись',
        content: newPostContent,
        authorId: user.id
      })
    });

    if (response.ok) {
      setNewPostContent('');
      loadPosts();
    }
  };

  return (
    <div id="posts-page">
      <div className="posts-container">
        
        <div className="publish-box">
          <textarea 
            placeholder="Что у вас нового?" 
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />
          <button onClick={handleCreatePost}>Опубликовать</button>
          <div style={{ clear: 'both' }}></div>
        </div>

        <div className="posts-list">
          {posts.length === 0 ? (
            <div className="empty-msg">Постов пока нет. Напишите что-нибудь!</div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="post-item">
                <div className="post-header">
                  <div className="avatar-stub"></div>
                  <div className="post-info">
                    <span className="author-name">{post.author?.username || 'Аноним'}</span>
                    <span className="post-date">
                      {new Date(post.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>
                <div className="post-content">{post.content}</div>

                <div className="post-actions">
                  <button className="like-btn" onClick={() => handleLike(post.id)}>
                    ❤️ {post.likes?.length || 0}
                  </button>
                </div>

                <div className="comments-section">
                  {post.comments?.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <span className="comment-author">{comment.author?.username}: </span>
                      <span className="comment-text">{comment.content}</span>
                    </div>
                  ))}
                  
                  <div className="comment-input-wrapper">
                    <input 
                      type="text" 
                      placeholder="Написать комментарий..." 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          handleCreateComment(post.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PostPage;
