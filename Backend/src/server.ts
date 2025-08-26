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
import { sendGeofences,
  addGeofence,
  updateGeofence,
  deleteGeofence,
  getGeofenceDetails
} from "./controllers/adminControllers";
import { socketAdminMiddleware } from "./middlewares/socketAdminMiddleware";



dotenv.config();


const app = express();
const prisma = new PrismaClient().$extends(withAccelerate());


app.use(cors({
  origin: ["https://geofen-system.vercel.app"], // your frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(bodyParser.json());


app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);


const PORT = process.env.PORT || 5000;
const server = http.createServer(app);


const io = new SocketIOServer(server, {
  path: "/api/socket.io",
  cors: {
    origin: ["https://geofen-system.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
  }
});


io.use(socketAuthMiddleware);


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

 
  socket.on("disconnect", (reason) => {
    console.log(`User ${socket.data.user?.id} disconnected: ${reason}`);
  });
});


process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

const adminNamespace = io.of("/admin");
adminNamespace.use(socketAdminMiddleware);
adminNamespace.on("connection", (socket) => {
  console.log(`Admin connected: ${socket.data.admin?.id} (${socket.id})`);

    socket.on("get-geofences", async () => {
    try {
      const adminId = socket.data.admin?.id;
      if (!adminId) return socket.emit("geofences-list", []);

      const geofences = await prisma.geoFenceArea.findMany({
        where: { createdBy: adminId },
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          radius: true,
          type: true,
          createdAt: true,
          coordinates: true,
          UserGeofence: {
            select: {
              id: true,
              userId: true,
              user: { select: { id: true, name: true, email: true } }
            }
          }
        }
      });

      // Send list to the admin socket
      socket.emit("geofences-list", geofences);

    } catch (error) {
      console.error("Failed to fetch geofences:", error);
      socket.emit("error", { message: "Failed to fetch geofences" });
    }
  });
  sendGeofences(socket);

   adminNamespace.on("connection_error", (err) => {
  console.log("Admin namespace connection error:", err);
});
  socket.on("add-geofence", (data) => addGeofence(socket, data));

  const adminId = socket.data.admin?.id;
  console.log(`Admin connected: ${adminId} (${socket.id})`);

  if (adminId) {
    socket.join(`admin:${adminId}`);
  }

  socket.on("update-geofence", (data) => updateGeofence(socket, data));

  
  socket.on("delete-geofence", (id) => deleteGeofence(socket, id));

  socket.on("get-geofence-details", (id) => getGeofenceDetails(socket, id));

 
  socket.on("disconnect", (reason) => {
    console.log(`Admin disconnected: ${socket.data.admin?.id} (${reason})`);
  });
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO available at ${process.env.CLIENT_URL}/api/socket.io`);
});

export { app, io, prisma };