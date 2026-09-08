import { Server } from "socket.io";

let io = null;

export function initIO(httpServer, corsOrigin) {
  io = new Server(httpServer, {
    cors: { origin: corsOrigin },
  });

  io.on("connection", (socket) => {
    socket.on("disconnect", () => {});
  });

  return io;
}

export function getIO() {
  return io;
}

export function broadcastBoardChanged(event) {
  if (!io) return;
  io.emit("board:changed", event);
}