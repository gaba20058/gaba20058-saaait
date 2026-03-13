import express from "express";
import { prisma } from "../db";
import { authenticateToken } from '../middleware/midd';

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: req.user!.id
        }
      },
      select: {
        id: true,
        username: true,
        email: true
      },
      orderBy: {
        username: 'asc'
      }
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;