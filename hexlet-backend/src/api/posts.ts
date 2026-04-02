import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { username: true } },
        likes: true,
        comments: {
          include: { 
            author: { select: { username: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка загрузки ленты" });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { title, content, authorId } = req.body;
  try {
    const newPost = await prisma.post.create({
      data: {
        title: title || "Без названия",
        content,
        authorId: Number(authorId)
      },
      include: { 
        author: { select: { username: true } },
        likes: true,
        comments: true 
      }
    });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ error: "Не удалось создать пост" });
  }
});

router.post('/:id/like', async (req: Request, res: Response) => {
  const { userId } = req.body;
  const postId = Number(req.params.id);
  
  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: Number(userId),
          postId: postId
        }
      }
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return res.json({ liked: false });
    }

    await prisma.like.create({
      data: {
        userId: Number(userId),
        postId: postId
      }
    });
    res.json({ liked: true });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при лайке" });
  }
});

router.post('/:id/comment', async (req: Request, res: Response) => {
  const { content, authorId } = req.body;
  const postId = Number(req.params.id);

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: Number(authorId),
        postId: postId
      },
      include: { author: { select: { username: true } } }
    });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при создании комментария" });
  }
});

export default router;
