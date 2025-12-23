import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Routes
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import chatRoutes from "./routes/chatRoutes";
import resyncRoutes from "./routes/rsyncRoutes";


// Sockets
import { initSockets } from "./socket";

dotenv.config();

// EXPRESS APP
const app = express();
const prisma = new PrismaClient().$extends(withAccelerate());
export type PrismaExt = typeof prisma;

app.use(
  cors({
    origin: ["https://geofen-system.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

// API ROUTES
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", resyncRoutes);

// HTTP + SOCKET.IO
const PORT = Number(process.env.PORT) || 5000;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  path: "/api/socket.io",
  cors: {
    origin: ["https://geofen-system.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: false,
  },
});

// INIT SOCKETS (only here, not inside server.ts again!)
initSockets(io, prisma);

// ERROR HANDLING
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// START SERVER
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Socket.IO available at /api/socket.io");
});


export { app, io, prisma };
