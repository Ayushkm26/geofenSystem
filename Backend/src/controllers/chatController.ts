import { prisma } from "../server";

// Get chat history between a user and an admin
import { Request, Response } from "express";

export const getChatHistory = async (
  req: Request<{ userId: string; adminId: string }>,
  res: Response
) => {
  try {
    const { userId, adminId } = req.params;

    if (!userId || !adminId) {
      return res.status(400).json({ message: "User ID and Admin ID are required" });
    }

    const chat = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: adminId },
          { senderId: adminId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: "asc" }
    });

    res.status(200).json(chat);
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
};
