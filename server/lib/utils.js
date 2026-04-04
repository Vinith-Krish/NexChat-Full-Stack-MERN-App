import jwt from "jsonwebtoken";
// Function to generate JWT token
export const generateToken = (user) => {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    return token;
};