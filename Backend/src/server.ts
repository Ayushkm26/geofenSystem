import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { handleSocketLocationUpdate, handleCurrentGeofenceRequest } from "./controllers/userControllers";
import { socketAuthMiddleware } from "./middlewares/socketmiddleware";

// Initialize configuration
dotenv.config();

// Create Express app
const app = express();
const prisma = new PrismaClient().$extends(withAccelerate());

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));
app.use(bodyParser.json());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);

// Server setup
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.IO Configuration
const io = new SocketIOServer(server, {
  path: "/api/socket.io",
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
  }
});

// Socket.IO Middleware
io.use(socketAuthMiddleware);

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log(`New connection from user ${socket.data.user?.id} (${socket.id})`);

  // Send current geofence status immediately on connection
  if (socket.data.user?.id) {
    handleCurrentGeofenceRequest(socket);
  }

  // Location Update Handler
  socket.on("location-update", async (data) => {
    try {
      await handleSocketLocationUpdate(socket, data);
    } catch (error) {
      console.error("Location update error:", error);
      socket.emit("location-error", {
        error: error instanceof Error ? error.message : "Location processing failed"
      });
    }
  });

  // Geofence Status Request Handler
  socket.on("get-current-geofence", () => {
    handleCurrentGeofenceRequest(socket);
  });

  // Stop Sharing Handler
  socket.on("stop-sharing", () => {
    console.log(`User ${socket.data.user?.id} stopped sharing location`);
    socket.emit("stopped-sharing-confirmation", { 
      timestamp: new Date(),
      message: "Location sharing stopped"
    });
  });

  // Disconnection Handler
  socket.on("disconnect", (reason) => {
    console.log(`User ${socket.data.user?.id} disconnected: ${reason}`);
  });
});

// Error Handling
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO available at ${process.env.CLIENT_URL}/api/socket.io`);
});

export { app, io, prisma };