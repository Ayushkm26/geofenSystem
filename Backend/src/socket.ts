// sockets.ts
import { Server as SocketIOServer, Namespace } from "socket.io";
import { socketAuthMiddleware } from "./middlewares/socketmiddleware";
import { socketAdminMiddleware } from "./middlewares/socketAdminMiddleware";
import { registerUserSocket } from "./Sockets/userSocket";
import { registerAdminSocket } from "./Sockets/adminSocket";
import { PrismaClient } from "@prisma/client";
import { PrismaExt } from "./server";

export function initSockets(io: SocketIOServer, prisma: PrismaExt) {
  // USER SOCKETS
  io.use(socketAuthMiddleware);
  registerUserSocket(io, prisma);

  // ADMIN SOCKETS (namespace)
  const adminNamespace: Namespace = io.of("/admin");
  adminNamespace.use(socketAdminMiddleware);
  registerAdminSocket(adminNamespace, prisma, io);
}
