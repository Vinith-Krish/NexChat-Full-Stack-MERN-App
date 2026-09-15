import mongoose from "mongoose";
import { logServerError } from "./logger.js";

// Function to connect to MongoDB
export const connectDB = async () => {
  try {
    mongoose.connection.on('connected',()=> console.log("Connected to MongoDB successfully"));
    await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
  } catch (error) {
    logServerError("MongoDB connection", error);
    process.exit(1);
  }
};