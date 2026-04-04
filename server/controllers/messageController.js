import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";
import { z } from "zod";
// get all users except the logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password",
    );
    // count number of unseen messages
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "Error fetching users" });
  }
};

// get all messages for selected users
export const getMessages = async (req, res) => {
  const schema = z.object({
    id: z.string().min(1),
  });
  const parseResult = schema.safeParse(req.params);
  if (!parseResult.success) {
    return res.json({ success: false, message: "Invalid user id", errors: parseResult.error.errors });
  }
  try {
    const { id: selectedUserId } = parseResult.data;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    const unseenMessages = await Message.find({
      senderId: selectedUserId,
      receiverId: myId,
      seen: false,
    }).select("_id senderId");

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true },
    );

    unseenMessages.forEach((message) => {
      const senderSocketId = userSocketMap[String(message.senderId)];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageSeen", { messageId: message._id });
      }
    });
    res.json({ success: true, messages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "Error fetching messages" });
  }
};
// api to mark message as seen using message id
export const markMessageSeen = async (req, res) => {
  const schema = z.object({
    id: z.string().min(1),
  });
  const parseResult = schema.safeParse(req.params);
  if (!parseResult.success) {
    return res.json({ success: false, message: "Invalid message id", errors: parseResult.error.errors });
  }
  try {
    const { id } = parseResult.data;
    const message = await Message.findByIdAndUpdate(id, { seen: true }, { new: true });
    if (message) {
      const senderSocketId = userSocketMap[String(message.senderId)];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageSeen", { messageId: message._id });
      }
    }
    res.json({ success: true, message: "Message marked as seen" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "Error marking message as seen" });
  }
};

// send message to selected user
export const sendMessage = async (req, res) => {
  const paramSchema = z.object({
    id: z.string().min(1),
  });
  const bodySchema = z.object({
    text: z.string().min(1).optional(),
    image: z.string().optional(),
  });
  const paramResult = paramSchema.safeParse(req.params);
  const bodyResult = bodySchema.safeParse(req.body);
  if (!paramResult.success || !bodyResult.success) {
    return res.json({ success: false, message: "Invalid input", errors: [paramResult.error?.errors, bodyResult.error?.errors] });
  }
  try {
    const { text, image } = bodyResult.data;
    const { id: receiverId } = paramResult.data;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    // emit the new message to receiver's socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "Error sending message" });
  }
};
