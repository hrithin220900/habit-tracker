import { io, Socket } from "socket.io-client";
import { config } from "./config.js";

let socket: Socket | null = null;

export function initSocket(token: String): Socket {
  if (socket?.connected) return socket;

  socket = io(config.api.socketUrl, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("Connected to socket");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from socket");
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinUserRoom(userId: string): void {
  if (socket) {
    socket.emit("join:user-room", { userId });
  }
}
