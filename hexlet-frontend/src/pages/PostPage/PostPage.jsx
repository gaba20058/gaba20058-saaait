import React from 'react';
import './PostPage.css';

const PostsPage = () => {
  return (
    <main className="main-content">
      <div className="container">
        <div className="posts-container">
          <div className="posts-header">
            <h2>Посты</h2>
            <button className="btn btn-primary">Создать пост</button>
          </div>
          <div className="posts-list">
            <p>Здесь пока нет постов. Создайте первый пост!</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PostsPage;
