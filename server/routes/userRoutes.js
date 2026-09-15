

import express from "express";
import { checkAuth, login, signup, updateProfile, logout, resetPassword, generateRecoveryCode,updateSkillsProfile,  // NEW
    getUsersBySkill, } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";
import { authRateLimit, authenticatedRateLimit } from "../lib/rateLimit.js";

const userRouter = express.Router();
// api endpoints for user
userRouter.post("/signup", authRateLimit, signup);
userRouter.post("/login", authRateLimit, login);
userRouter.post("/logout", protectRoute, authenticatedRateLimit, logout);
userRouter.put("/update-profile", protectRoute, authenticatedRateLimit, updateProfile);
userRouter.get("/check", protectRoute, authenticatedRateLimit, checkAuth);
userRouter.post("/recovery-code", protectRoute, authenticatedRateLimit, generateRecoveryCode);
userRouter.post("/reset-password", authRateLimit, resetPassword);
// NEW: Update skills and expertise
userRouter.put("/skills-profile", protectRoute, authenticatedRateLimit, updateSkillsProfile);
userRouter.get("/discover", protectRoute, authenticatedRateLimit, getUsersBySkill);


export default userRouter;