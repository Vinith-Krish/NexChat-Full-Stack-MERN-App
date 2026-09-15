import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { authenticatedRateLimit } from "../lib/rateLimit.js";
import { deleteMessage, getMessages, getUsersForSidebar, markMessageSeen, sendMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, authenticatedRateLimit, getUsersForSidebar);
messageRouter.get("/:id", protectRoute, authenticatedRateLimit, getMessages);
messageRouter.put("/mark/:id", protectRoute, authenticatedRateLimit, markMessageSeen);
messageRouter.post("/send/:id", protectRoute, authenticatedRateLimit, sendMessage);
messageRouter.delete("/:id", protectRoute, authenticatedRateLimit, deleteMessage);
export default messageRouter;