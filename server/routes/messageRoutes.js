import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { deleteMessage, getMessages, getUsersForSidebar, markMessageSeen, sendMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users",protectRoute,getUsersForSidebar);
messageRouter.get("/:id",protectRoute,getMessages);
messageRouter.put("/mark/:id",protectRoute,markMessageSeen);
messageRouter.post("/send/:id",protectRoute,sendMessage);
messageRouter.delete("/:id",protectRoute,deleteMessage);
export default messageRouter;