import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server } from "socket.io";

function getAllowedOrigins(): string[] {
  return (
    process.env.FRONTEND_URLS ?? "http://localhost:5173,http://127.0.0.1:5173"
  ).split(",");
}

@WebSocketGateway({
  cors: {
    origin: getAllowedOrigins(),
    credentials: true,
  },
})
export class TasksGateway {
  @WebSocketServer()
  server: Server;

  emitTasksChanged(): void {
    this.server?.emit("tasks:changed");
  }
}
