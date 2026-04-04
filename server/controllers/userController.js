import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import { sendPasswordResetOtpEmail } from "../lib/email.js";
import User from "../models/User.js";

const OTP_PEPPER = process.env.OTP_PEPPER || "otp-dev-pepper-change-in-production";

function hashOtp(otp) {
    return crypto.createHash("sha256").update(String(otp).trim() + OTP_PEPPER).digest("hex");
}

function generateSixDigitOtp() {
    return String(crypto.randomInt(100000, 1000000));
}

function getCookieOptions() {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
}

// Forgot password: generate OTP (email in production; dev logs + optional JSON)
export const forgotPassword = async (req, res) => {
    const schema = z.object({
        email: z.string().email(),
    });
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid email", errors: parseResult.error.errors });
    }
    const { email } = parseResult.data;
    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ message: "If your email exists, a verification code has been sent." });
    }
    const otp = generateSixDigitOtp();
    user.passwordResetOtpHash = hashOtp(otp);
    user.passwordResetOtpExpires = Date.now() + 1000 * 60 * 15; // 15 min
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    try {
        const emailResult = await sendPasswordResetOtpEmail({ to: email, otp });
        if (!emailResult.sent) {
            console.log("[password reset] Email provider not configured; OTP available in dev logs.");
        }
    } catch (error) {
        console.error("[password reset] Failed to send reset OTP email:", error.message);
        if (process.env.NODE_ENV === "production") {
            return res.status(500).json({ message: "Unable to send verification code. Please try again." });
        }
    }

    console.log(`[password reset] OTP for ${email}: ${otp}`);
    const payload = { message: "If your email exists, a verification code has been sent." };
    const exposeOtp =
        process.env.NODE_ENV === "development" || process.env.DEV_EXPOSE_RESET_OTP === "true";
    if (exposeOtp) {
        payload._dev = { otp };
    }
    return res.json(payload);
};

// After OTP is verified, issue a one-time reset token (same as final reset-password step)
export const verifyResetOtp = async (req, res) => {
    const schema = z.object({
        email: z.string().email(),
        otp: z.string().regex(/^\d{6}$/),
    });
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid email or code", errors: parseResult.error.errors });
    }
    const { email, otp } = parseResult.data;
    const user = await User.findOne({
        email,
        passwordResetOtpExpires: { $gt: Date.now() },
    });
    if (!user || !user.passwordResetOtpHash) {
        return res.status(400).json({ message: "Invalid or expired code" });
    }
    if (user.passwordResetOtpHash !== hashOtp(otp)) {
        return res.status(400).json({ message: "Invalid or expired code" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 min
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpires = undefined;
    await user.save();
    return res.json({
        message: "Code verified. You can set a new password.",
        resetToken: token,
    });
};

// Reset password using token (issued after OTP verification)
export const resetPassword = async (req, res) => {
    const schema = z.object({
        token: z.string(),
        password: z.string().min(6),
    });
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid input", errors: parseResult.error.errors });
    }
    const { token, password } = parseResult.data;
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.json({ message: "Password reset successful. You can now log in." });
};

// signup new user
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
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            bio,
        });
        await newUser.save();
        const userData = newUser.toObject();
        delete userData.password;
        const token = generateToken(newUser._id);
        res.json({ success: true, userData, token, message: "User created successfully" });
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
        const token = generateToken(userData._id);
        const safeUser = await User.findById(userData._id).select("-password");
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
            updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio }, { new: true }).select("-password");
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio, profilePic: upload.secure_url }, { new: true }).select("-password");
        }
        res.json({ success: true, userData: updatedUser, message: "Profile updated successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "Error updating profile" });
    }
};
