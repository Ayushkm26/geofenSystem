import { Namespace, Socket, Server as SocketIOServer } from "socket.io";
import {
  sendGeofences,
  addGeofence,
  updateGeofence,
  deleteGeofence,
  getGeofenceDetails,
} from "../controllers/adminControllers";
import { prisma } from "../server";

const onlineAdmins = new Map<string, string>();

export function registerAdminSocket(
  adminNamespace: Namespace,
  prismaInstance = prisma,
  ioInstance: SocketIOServer
) {
  adminNamespace.on("connection", (socket: Socket) => {
    const adminId = socket.data.admin?.id;
    if (!adminId) return;

    console.log(`✅ Admin connected: ${adminId} (${socket.id})`);
    onlineAdmins.set(adminId, socket.id);

    // ------------------ CHAT ------------------

    // Admin joins a chat room with a specific user
    socket.on("join-chat", ({ userId }) => {
      if (!userId) return;

      const room = `chat:${userId}:${adminId}`;
      socket.join(room);
      console.log(`Admin ${adminId} joined chat room ${room}`);
      socket.emit("chat-joined", { room, userId });
    });

    // Send message to a specific user
    socket.on("send-message", async ({ receiverId, content }) => {
      if (!receiverId || !content) return;

      try {
        const message = await prismaInstance.message.create({
          data: {
            senderId: adminId,
            receiverId,
            senderRole: "ADMIN",
            receiverRole: "USER",
            content,
          },
        });

        const room = `chat:${receiverId}:${adminId}`;
        // Emit to both admin and user in the room
        ioInstance.to(room).emit("receive-message", message);
        socket.emit("message-sent", message);
      } catch (err) {
        console.error(`Send message error for admin ${adminId}:`, err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Fetch chat history with a specific user
    socket.on("fetch-messages", async ({ userId }) => {
      if (!userId) return;

      try {
        const history = await prismaInstance.message.findMany({
          where: {
            OR: [
              { senderId: adminId, receiverId: userId },
              { senderId: userId, receiverId: adminId },
            ],
          },
          orderBy: { createdAt: "asc" },
        });

        socket.emit("chat-history", history);
      } catch (err) {
        console.error(`Fetch messages error for admin ${adminId}:`, err);
        socket.emit("error", { message: "Failed to fetch chat history" });
      }
    });

    // ------------------ GEOFENCE ------------------
    socket.on("get-geofences", async () => {
      try {
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
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        });
        socket.emit("geofences-list", geofences);
      } catch (err) {
        console.error(`Failed to fetch geofences for admin ${adminId}:`, err);
        socket.emit("error", { message: "Failed to fetch geofences" });
      }
    });

    sendGeofences(socket);
    socket.on("add-geofence", (data) => addGeofence(socket, data));
    socket.on("update-geofence", (data) => updateGeofence(socket, data));
    socket.on("delete-geofence", (id) => deleteGeofence(socket, id));
    socket.on("get-geofence-details", (id) => getGeofenceDetails(socket, id));

    // ------------------ DISCONNECT ------------------
    socket.on("disconnect", (reason) => {
      console.log(`Admin ${adminId} disconnected: ${reason}`);
      onlineAdmins.delete(adminId);
    });
  });
}
