import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.get("/", (req, res) => res.send("Socket.IO chat server is running"));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const messages = [];
io.on("connection", (socket) => {
  socket.emit("chat-history", messages);
  socket.on("chat-message", (data) => {
    const name = String(data?.name || "Guest")
      .trim()
      .slice(0, 30);
    const message = String(data?.message || "")
      .trim()
      .slice(0, 500);
    if (!message) return;
    const item = {
      id: `${Date.now()}-${socket.id}`,
      name,
      message,
      time: new Date().toLocaleTimeString(),
    };
    messages.push(item);
    if (messages.length > 50) messages.shift();
    io.emit("chat-message", item);
  });
});
server.listen(3000, () =>
  console.log("Chat server running at http://localhost:3000"),
);
