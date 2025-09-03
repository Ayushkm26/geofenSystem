import { Namespace, Socket } from "socket.io";
import { handleCurrentGeofenceRequest } from "../controllers/userControllers";
import { handleSocketLocationUpdate } from "../controllers/location.service";
import { prisma } from "../server";

// Track online users: userId -> socketId
const onlineUsers = new Map<string, string>();

export function registerUserSocket(namespace: Namespace, prismaInstance = prisma) {
  namespace.on("connection", (socket: Socket) => {
    const userId = socket.data.user?.id;
    if (!userId) return;

    console.log(`User connected: ${userId} (${socket.id})`);
    onlineUsers.set(userId, socket.id);

    // Join personal room for private messages
    socket.join(`user:${userId}`);

    // 🔹 Send current geofence on connect
    handleCurrentGeofenceRequest(socket);

    // 🔹 Location Updates
    socket.on("location-update", async (data) => {
      try {
        await handleSocketLocationUpdate(socket, data);
        console.log(`Location update success for ${userId}`);
      } catch (error) {
        console.error(`Location update error for ${userId}:`, error);
        socket.emit("location-error", {
          error: error instanceof Error ? error.message : "Location processing failed",
        });
      }
    });

    // 🔹 Get Current Geofence
    socket.on("get-current-geofence", () => handleCurrentGeofenceRequest(socket));

    // 💬 Join Chat (User → Admin)
    socket.on("join-chat", async () => {
      try {
        const userGeofence = await prismaInstance.userGeofence.findFirst({
          where: { userId },
          include: { geoFenceArea: { select: { id: true, createdBy: true } } },
        });

        if (!userGeofence) {
          return socket.emit("error", { message: "No active geofence found for this user" });
        }

        const adminId = userGeofence.geoFenceArea.createdBy;
        const room = `chat:${userId}:${adminId}`;
        socket.join(room);

        console.log(`User ${userId} joined chat with Admin ${adminId} (room: ${room})`);
        socket.emit("chat-joined", { room, adminId });
      } catch (err) {
        console.error("Join chat error:", err);
        socket.emit("error", { message: "Failed to join chat" });
      }
    });

    // 💬 Send Message (User → Admin in geofence)
    socket.on("send-message", async ({ content }) => {
      if (!content) return;

      try {
        const userGeofence = await prismaInstance.userGeofence.findFirst({
          where: { userId },
          include: { geoFenceArea: { select: { createdBy: true } } },
        });

        if (!userGeofence) {
          return socket.emit("error", { message: "You are not inside any admin's geofence" });
        }

        const adminId = userGeofence.geoFenceArea.createdBy;
        const room = `chat:${userId}:${adminId}`;

        const message = await prismaInstance.message.create({
          data: {
            senderId: userId,
            receiverId: adminId,
            senderRole: "USER",
            receiverRole: "ADMIN",
            content,
          },
        });

        // Emit only to this user & admin
        namespace.to(room).emit("receive-message", message);
        socket.emit("message-sent", message);
      } catch (err) {
        console.error("Send message error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // 🛑 Stop Sharing Location
    socket.on("stop-sharing", () => {
      console.log(`User ${userId} stopped sharing location`);
      socket.emit("stopped-sharing-confirmation", {
        timestamp: new Date(),
        message: "Location sharing stopped",
      });
    });

    // 🔹 Disconnect
    socket.on("disconnect", (reason) => {
      onlineUsers.delete(userId);
      console.log(`User ${userId} disconnected: ${reason}`);
    });
  });
}
