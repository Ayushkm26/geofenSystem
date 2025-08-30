import { io } from "socket.io-client";

 export const newSocket = io(`${import.meta.env.VITE_BASE_URL}`, {
    path: "/api/socket.io",
    transports: ["websocket"],
    auth: { token: localStorage.getItem("token") },
    withCredentials: true,
  });
