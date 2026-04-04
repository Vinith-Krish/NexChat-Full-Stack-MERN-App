

import express from "express";
import { checkAuth, login, signup, updateProfile, logout, resetPassword, generateRecoveryCode } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();
// api endpoints for user
userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);
userRouter.post("/recovery-code", protectRoute, generateRecoveryCode);
userRouter.post("/reset-password", resetPassword);

export default userRouter;