import { Socket } from "socket.io";
import { verifyAuthentication } from "../utils/verification";

// src/sockets/middleware.ts
export async function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  try {
    console.log('Socket connection attempt:', socket.id);
    console.log('Handshake auth:', socket.handshake.auth);
    console.log('Handshake headers:', socket.handshake.headers);

    const token = socket.handshake.auth.token || 
                 socket.handshake.query?.token ||
                 socket.handshake.headers?.authorization?.split(' ')[1];
    
    console.log('Extracted token:', token);

    if (!token) {
      console.log('No token found');
      return next(new Error("Authentication error: No token provided"));
    }

    const { user, newAccessToken } = await verifyAuthentication(token);
    console.log('Authenticated user:', user);

    if (!user?.id) {
      console.log('No user ID found in token');
      return next(new Error("Authentication error: No user ID in token"));
    }

    socket.data.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error instanceof Error) {
      next(new Error(error.message));
    } else {
      next(new Error("Unknown authentication error"));
    }
  }
}