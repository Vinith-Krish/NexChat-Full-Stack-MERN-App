import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
// Create Express app and HTTP Server
const app = express();
const server = http.createServer(app);

// intialize socket.io server
export const io = new Server(server, {
  cors: { origin: "*" },
});
// store online users
export const userSocketMap = {}; // {userId: socketId}

// Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected with ID:", userId);
  if (userId) {
    userSocketMap[userId] = socket.id;
  }
  // emit online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on("disconnect", () => {
    console.log("User disconnected with ID:", userId);
    delete userSocketMap[userId];
    // emit updated online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// Routes Setup
app.use("/api/status", (req, res) => res.send("Server is running fine"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// connect to mongodb
await connectDB();

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
