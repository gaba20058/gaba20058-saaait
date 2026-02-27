import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRouter from './api/auth';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../../hexlet-frontend')));

app.use('/api/auth', authRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../../hexlet-frontend/index.html'));
});

export default app;