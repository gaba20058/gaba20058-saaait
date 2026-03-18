import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/midd';

const router = express.Router();

// 1. ПОЛУЧЕНИЕ СПИСКА ЧАТОВ
router.get('/', authenticateToken, async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: req.user!.id
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    // Форматируем ответ: берем первое сообщение из массива messages и кладем в lastMessage
    const formattedChats = chats.map(chat => ({
      ...chat,
      lastMessage: chat.messages[0] || null
    }));

    res.json(formattedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. СОЗДАНИЕ ЧАТА
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, participants } = req.body;

    if (!name || !participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'Chat name and participants are required' });
    }

    const allParticipants = [...new Set([...participants.map(Number), req.user!.id])];

    const chat = await prisma.chat.create({
      data: {
        name,
        participants: {
          create: allParticipants.map(userId => ({
            userId
          }))
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. УДАЛЕНИЕ ЧАТА (Исправлена ошибка типизации)
router.delete('/:chatId', authenticateToken, async (req, res) => {
  try {
    // String() гарантирует, что parseInt получит строку и ошибка TS уйдет
    const chatId = parseInt(String(req.params.chatId));

    if (isNaN(chatId)) {
        return res.status(400).json({ error: 'Invalid chat ID' });
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: true }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(p => p.userId === req.user!.id);
    if (!isParticipant) {
      return res.status(403).json({ error: 'You are not a participant of this chat' });
    }

    // Каскадное удаление вручную
    await prisma.message.deleteMany({ where: { chatId } });
    await prisma.chatParticipant.deleteMany({ where: { chatId } });
    await prisma.chat.delete({ where: { id: chatId } });

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. ПОЛУЧЕНИЕ СООБЩЕНИЙ ЧАТА (Исправлена ошибка типизации)
router.get('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const chatId = parseInt(String(req.params.chatId));

    if (isNaN(chatId)) {
        return res.status(400).json({ error: 'Invalid chat ID' });
    }

    const participant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: req.user!.id
        }
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. ОТПРАВКА СООБЩЕНИЯ (Исправлена ошибка типизации)
router.post('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const chatId = parseInt(String(req.params.chatId));
    const { content } = req.body;

    if (isNaN(chatId) || !content) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const participant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: req.user!.id
        }
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        chatId,
        senderId: req.user!.id
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
