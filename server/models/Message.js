import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
   senderId:{type: mongoose.Schema.Types.ObjectId, required: true,ref:"User"},
   receiverId:{type: mongoose.Schema.Types.ObjectId, required: true,ref:"User"},
   text:{type: String},
   image:{type: String},
   attachment: {
      url: { type: String },
      fileName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
   },
   replyTo: {
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String },
      image: { type: String },
      attachment: {
         url: { type: String },
         fileName: { type: String },
         mimeType: { type: String },
         size: { type: Number },
      },
   },
   seen:{type: Boolean, default: false}
},{timestamps: true});

const Message = mongoose.model("Message",messageSchema);

export default Message;