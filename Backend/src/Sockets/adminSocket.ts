    import { Namespace, Socket, Server as SocketIOServer } from "socket.io";
import { sendGeofences, addGeofence, updateGeofence, deleteGeofence, getGeofenceDetails } from "../controllers/adminControllers";
import { prisma } from "../server";

export function registerAdminSocket(adminNamespace: Namespace, prismaInstance = prisma, ioInstance: SocketIOServer) {
  adminNamespace.on("connection", (socket: Socket) => {
    const adminId = socket.data.admin?.id;
    console.log(`Admin connected: ${adminId} (${socket.id})`);

    if (adminId) socket.join(`admin:${adminId}`);

    // Geofence APIs
    socket.on("get-geofences", async () => {
      try {
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
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        });
        socket.emit("geofences-list", geofences);
      } catch (error) {
        console.error("Failed to fetch geofences:", error);
        socket.emit("error", { message: "Failed to fetch geofences" });
      }
    });

    sendGeofences(socket);
    socket.on("add-geofence", (data) => addGeofence(socket, data));
    socket.on("update-geofence", (data) => updateGeofence(socket, data));
    socket.on("delete-geofence", (id) => deleteGeofence(socket, id));
    socket.on("get-geofence-details", (id) => getGeofenceDetails(socket, id));

    // Messaging (Admin → User)
    socket.on("send-message", async ({ receiverId, content }) => {
      try {
        const message = await prisma.message.create({
          data: {
            senderId: adminId,
            receiverId,
            senderRole: "ADMIN",
            receiverRole: "USER",
            content,
          },
        });

        adminNamespace.to(`user:${receiverId}`).emit("receive-message", message);
        socket.emit("message-sent", message);
      } catch (err) {
        console.error("Send message error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`Admin ${adminId} disconnected: ${reason}`);
    });
  });
}
