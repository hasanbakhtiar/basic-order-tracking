import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { eventBus } from "./events";

export function initSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, { cors: { origin: "*" } });

  io.use((socket, next) => {
    try {
      const payload = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET!);
      socket.data.userId = Number(payload.sub);
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.data.userId}`); // hər istifadəçi öz room-unda
  });

  eventBus.on("order.status", (event) => {
    io.to(`user:${event.userId}`).emit("order:status", event);
  });

  return io;
}
