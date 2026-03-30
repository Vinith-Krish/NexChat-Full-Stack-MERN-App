import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
// signup new user
export const signup = async (req, res) => {
    const {fullName, email, password,bio} = req.body;
    try {
        if(!fullName || !email || !password || !bio){
            return res.json({success: false, message: "Missing required fields"});
        }
        const user = await User.findOne({email});
        if(user){
            return res.json({success: false, message: "User already exists"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            bio
        });
        await newUser.save();
        const token = generateToken(newUser._id);
        res.json({success: true, userData: newUser, token, message: "User created successfully"});

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: "Error creating user"});
    }
}
// Controller to login a user
export const login = async (req, res) => {
    try{
        const {email, password} = req.body;
        const userData = await User.findOne({email});

        const isPassword = await bcrypt.compare(password, userData.password);
        if(!isPassword){
            return res.json({success: false, message: "Invalid credentials"});
        }
        const token = generateToken(userData._id);
        res.json({success: true, userData, token, message: "User logged in successfully"});


    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: "Error logging in"});
    }
}
// Controller to check if user is authenticated
export const checkAuth = (req, res) => {
    res.json({success:true,user:req.user});
}

// controller to update user profile details
export const updateProfile = async(req, res) => {
    try {
        const {fullName, bio, profilePic} = req.body;
        const userId = req.user._id;
        let updatedUser;
        if(!profilePic){
          updatedUser = await User.findByIdAndUpdate(userId, {fullName, bio}, {returnDocument: 'after'});
        } else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, {fullName, bio, profilePic: upload.secure_url}, {returnDocument: 'after'});
        }
        res.json({success: true, userData: updatedUser, message: "Profile updated successfully"});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: "Error updating profile"});
    }
}