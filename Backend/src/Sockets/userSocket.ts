import { Socket, Server as SocketIOServer } from "socket.io";
import {  handleCurrentGeofenceRequest } from "../controllers/userControllers";
import { handleSocketLocationUpdate } from "../controllers/location.service";
import { prisma } from "../server";

export function registerUserSocket(io: SocketIOServer, prismaInstance = prisma) {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.data.user?.id} (${socket.id})`);
    const userId = socket.data.user?.id;

    if (userId) {   
      socket.join(`user:${userId}`);
      handleCurrentGeofenceRequest(socket);
    }

    // Location Updates
    socket.on("location-update", async (data) => {
      try {
        await handleSocketLocationUpdate(socket, data);
      } catch (error) {
        console.error("Location update error:", error);
        socket.emit("location-error", {
          error: error instanceof Error ? error.message : "Location processing failed",
        });
      }
    });

    // Request Current Geofence
    socket.on("get-current-geofence", () => handleCurrentGeofenceRequest(socket));

    // Messaging (User → Admin)
    socket.on("send-message", async ({ receiverId, content }) => {
      try {
        const message = await prisma.message.create({
          data: {
            senderId: userId,
            receiverId,
            senderRole: "USER",
            receiverRole: "ADMIN",
            content,
          },
        });

        io.to(`admin:${receiverId}`).emit("receive-message", message);
        socket.emit("message-sent", message);
      } catch (err) {
        console.error("Send message error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Stop Sharing
    socket.on("stop-sharing", () => {
      console.log(`User ${userId} stopped sharing location`);
      socket.emit("stopped-sharing-confirmation", {
        timestamp: new Date(),
        message: "Location sharing stopped",
      });
    });

    socket.on("disconnect", (reason) => {
      console.log(`User ${userId} disconnected: ${reason}`);
    });
  });
}
