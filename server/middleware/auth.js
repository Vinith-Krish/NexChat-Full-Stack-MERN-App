import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Middleware to protect routes
export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if ((user.tokenVersion ?? 0) !== (decoded.tokenVersion ?? 0)) {
            return res.status(401).json({ success: false, message: "Session expired" });
        }
        const safeUser = user.toObject();
        delete safeUser.password;
        delete safeUser.recoveryCodeHash;
        delete safeUser.recoveryCodeIssuedAt;
        delete safeUser.tokenVersion;
        req.user = safeUser;
        next();
    } catch (error) {
        console.log(error.message);
        res.status(401).json({ success: false, message: "Error protecting route" });
    }
};