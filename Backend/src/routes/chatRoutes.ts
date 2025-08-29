import express from "express";
import { getChatHistory } from "../controllers/chatController";
import { authAdminMiddleware } from "../middlewares/adminMiddlewares";

const router = express.Router();

// Example: GET /api/chat/history/:userId/:adminId
router.get("/history/:userId/:adminId", authAdminMiddleware, getChatHistory);

export default router;
