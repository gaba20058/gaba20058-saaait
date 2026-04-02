import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRouter from './api/auth';
import chatRouter from './api/chat';
import usersRouter from './api/users';
import postsRouter from './api/posts';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../../hexlet-frontend')));

console.log('authRouter:', typeof authRouter);
console.log('chatRouter:', typeof chatRouter);
console.log('usersRouter:', typeof usersRouter);
console.log('postsRouter:', typeof postsRouter);

app.use('/api/auth', authRouter);
app.use('/api/chats', chatRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, '../../hexlet-frontend/index.html'));
});

export default app;