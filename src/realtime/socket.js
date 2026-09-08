import { io } from "socket.io-client";
import { SOCKET_URL } from "../api/client";

let socket = null;

export function connectSocket() {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}