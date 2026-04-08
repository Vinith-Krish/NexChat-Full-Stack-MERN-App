import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";
import { z } from "zod";
import { encryptMessage, decryptMessage } from "../lib/encryption.js";

const getSkillNames = (userDoc) => {
  if (!userDoc?.skills || !Array.isArray(userDoc.skills)) return [];
  return userDoc.skills
    .map((skill) => String(skill?.name || "").trim().toLowerCase())
    .filter(Boolean);
};

const hasSkillMatch = (firstUser, secondUser) => {
  const firstSkills = getSkillNames(firstUser);
  const secondSkills = new Set(getSkillNames(secondUser));

  if (firstSkills.length === 0 || secondSkills.size === 0) {
    return false;
  }

  return firstSkills.some((skill) => secondSkills.has(skill));
};

const canUsersChat = async (firstUserId, secondUserId) => {
  const users = await User.find({ _id: { $in: [firstUserId, secondUserId] } })
    .select("skills")
    .lean();

  if (users.length !== 2) {
    return false;
  }

  return hasSkillMatch(users[0], users[1]);
};
// get all users except the logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentUser = await User.findById(userId).select("skills").lean();
    if (!currentUser || getSkillNames(currentUser).length === 0) {
      return res.json({ success: true, users: [], unseenMessages: {} });
    }

    const otherUsers = await User.find({ _id: { $ne: userId } }).select("-password").lean();
    const filteredUsers = otherUsers.filter((user) => hasSkillMatch(currentUser, user));
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
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

// get all messages for selected users
export const getMessages = async (req, res) => {
  const schema = z.object({
    id: z.string().min(1),
  });
  const parseResult = schema.safeParse(req.params);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, message: "Invalid user id", errors: parseResult.error.errors });
  }
  try {
    const { id: selectedUserId } = parseResult.data;
    const myId = req.user._id;

    const allowedToChat = await canUsersChat(myId, selectedUserId);
    if (!allowedToChat) {
      return res.status(403).json({ success: false, message: "Messaging is allowed only with users sharing at least one skill" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    // Decrypt all messages
    const decryptedMessages = messages.map((msg) => ({
      ...msg.toObject(),
      text: decryptMessage(msg.text),
    }));

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
    res.json({ success: true, messages: decryptedMessages });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Error fetching messages" });
  }
};
// api to mark message as seen using message id
export const markMessageSeen = async (req, res) => {
  const schema = z.object({
    id: z.string().min(1),
  });
  const parseResult = schema.safeParse(req.params);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, message: "Invalid message id", errors: parseResult.error.errors });
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
    res.status(500).json({ success: false, message: "Error marking message as seen" });
  }
};

// delete a message by id (only sender can delete)
export const deleteMessage = async (req, res) => {
  const schema = z.object({
    id: z.string().min(1),
  });
  const parseResult = schema.safeParse(req.params);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, message: "Invalid message id", errors: parseResult.error.errors });
  }

  try {
    const { id } = parseResult.data;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (String(message.senderId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this message" });
    }

    await Message.findByIdAndDelete(id);

    const senderSocketId = userSocketMap[String(message.senderId)];
    const receiverSocketId = userSocketMap[String(message.receiverId)];
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDeleted", { messageId: message._id });
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId: message._id });
    }

    res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Error deleting message" });
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
    replyToMessageId: z.string().min(1).optional(),
  });
  const paramResult = paramSchema.safeParse(req.params);
  const bodyResult = bodySchema.safeParse(req.body);
  if (!paramResult.success || !bodyResult.success) {
    return res.status(400).json({ success: false, message: "Invalid input", errors: [paramResult.error?.errors, bodyResult.error?.errors] });
  }
  try {
    const { text, image, replyToMessageId } = bodyResult.data;
    const { id: receiverId } = paramResult.data;
    const senderId = req.user._id;

    const allowedToChat = await canUsersChat(senderId, receiverId);
    if (!allowedToChat) {
      return res.status(403).json({ success: false, message: "You can message only users with at least one matching skill" });
    }

    if (!text && !image) {
      return res.status(400).json({ success: false, message: "Message text or image is required" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let replyToPayload;
    if (replyToMessageId) {
      const repliedMessage = await Message.findOne({
        _id: replyToMessageId,
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      });

      if (!repliedMessage) {
        return res.status(404).json({ success: false, message: "Replied message not found" });
      }

      replyToPayload = {
        messageId: repliedMessage._id,
        senderId: repliedMessage.senderId,
        text: decryptMessage(repliedMessage.text),
        image: repliedMessage.image,
      };
    }
    
    // Encrypt the text before saving
    const encryptedText = encryptMessage(text);
    
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: encryptedText,
      image: imageUrl,
      replyTo: replyToPayload,
    });
    
    // Decrypt for real-time socket emission (receiver sees unencrypted)
    const decryptedMessage = {
      ...newMessage.toObject(),
      text: text,
    };
    
    // emit the new message to receiver's socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", decryptedMessage);
    }
    res.json({ success: true, message: decryptedMessage });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Error sending message" });
  }
};
