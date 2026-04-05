import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";

const RECOVERY_CODE_PEPPER = process.env.RECOVERY_CODE_PEPPER || "recovery-code-dev-pepper-change-in-production";

function hashRecoveryCode(code) {
    return crypto.createHash("sha256").update(String(code).trim().toUpperCase() + RECOVERY_CODE_PEPPER).digest("hex");
}

function createRecoveryCode() {
    const raw = crypto.randomBytes(8).toString("hex").toUpperCase();
    return raw.match(/.{1,4}/g).join("-");
}

function getCookieOptions() {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
}

function issueRecoveryCodeForUser(user) {
    const recoveryCode = createRecoveryCode();
    user.recoveryCodeHash = hashRecoveryCode(recoveryCode);
    user.recoveryCodeIssuedAt = new Date();
    return recoveryCode;
}

// Reset password using email + recovery code
export const resetPassword = async (req, res) => {
    const schema = z.object({
        email: z.string().email(),
        recoveryCode: z.string().min(8),
        password: z.string().min(6),
    });
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid input", errors: parseResult.error.errors });
    }
    const { email, recoveryCode, password } = parseResult.data;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid email or recovery code" });
    }
    if (!user.recoveryCodeHash || user.recoveryCodeHash !== hashRecoveryCode(recoveryCode)) {
        return res.status(400).json({ message: "Invalid email or recovery code" });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    user.recoveryCodeHash = undefined;
    user.recoveryCodeIssuedAt = undefined;
    await user.save();
    return res.json({ message: "Password reset successful. Please sign in again." });
};

// Generate a new recovery code for the logged in user
export const generateRecoveryCode = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    const recoveryCode = issueRecoveryCodeForUser(user);
    await user.save();
    return res.json({ success: true, recoveryCode, message: "New recovery code generated" });
};

// Signup new user and issue a recovery code once
export const signup = async (req, res) => {
    const schema = z.object({
        fullName: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        bio: z.string().min(1),
    });
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
        return res.json({ success: false, message: "Invalid input", errors: parseResult.error.errors });
    }
    const { fullName, email, password, bio } = parseResult.data;
    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.json({ success: false, message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const recoveryCode = createRecoveryCode();
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            bio,
            tokenVersion: 0,
            recoveryCodeHash: hashRecoveryCode(recoveryCode),
            recoveryCodeIssuedAt: new Date(),
        });
        await newUser.save();
        const userData = newUser.toObject();
        delete userData.password;
        delete userData.recoveryCodeHash;
        delete userData.recoveryCodeIssuedAt;
        delete userData.tokenVersion;
        res.json({ success: true, userData, recoveryCode, message: "User created successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "Error creating user" });
    }
};
// Controller to login a user
export const login = async (req, res) => {
    const schema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
    });
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
        return res.json({ success: false, message: "Invalid input", errors: parseResult.error.errors });
    }
    const { email, password } = parseResult.data;
    try {
        const userData = await User.findOne({ email });
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }
        const isPassword = await bcrypt.compare(password, userData.password);
        if (!isPassword) {
            return res.json({ success: false, message: "Invalid credentials" });
        }
        const token = generateToken(userData);
        const safeUser = await User.findById(userData._id).select("-password -recoveryCodeHash -recoveryCodeIssuedAt -tokenVersion");
        res.cookie("token", token, getCookieOptions());
        res.json({ success: true, userData: safeUser, message: "User logged in successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "Error logging in" });
    }
};
// Logout controller to clear cookie
export const logout = (req, res) => {
    const cookieOptions = getCookieOptions();
    res.clearCookie("token", {
        httpOnly: cookieOptions.httpOnly,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite,
        path: cookieOptions.path,
    });
    res.json({ success: true, message: "Logged out" });
};
// Controller to check if user is authenticated
export const checkAuth = (req, res) => {
    res.json({success:true,user:req.user});
}

// controller to update user profile details
export const updateProfile = async (req, res) => {
    const schema = z.object({
        fullName: z.string().min(1),
        bio: z.string().min(1),
        profilePic: z.string().optional(),
    });
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
        return res.json({ success: false, message: "Invalid input", errors: parseResult.error.errors });
    }
    const { fullName, bio, profilePic } = parseResult.data;
    const userId = req.user._id;
    try {
        let updatedUser;
        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio }, { new: true }).select("-password -recoveryCodeHash -recoveryCodeIssuedAt -tokenVersion");
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio, profilePic: upload.secure_url }, { new: true }).select("-password -recoveryCodeHash -recoveryCodeIssuedAt -tokenVersion");
        }
        res.json({ success: true, userData: updatedUser, message: "Profile updated successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "Error updating profile" });
    }
};
