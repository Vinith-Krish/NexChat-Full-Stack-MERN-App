import jwt from "jsonwebtoken";
// Function to generate JWT token
export const generateToken = (user) => {
    const token = jwt.sign({ userId: user._id, tokenVersion: user.tokenVersion ?? 0 }, process.env.JWT_SECRET);
    return token;
};