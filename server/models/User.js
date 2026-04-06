import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email:{type: String, required: true, unique: true},
    password:{type: String, required: true , minlength: 6},
    fullName:{type: String, required: true},
    profilePic:{type: String, default:""},
    bio:{type: String},
    tokenVersion:{type: Number, default: 0},
    recoveryCodeHash: String,
    recoveryCodeIssuedAt: Date,
    
    // NEW: Skills & Expertise
    skills: [
        {
            name: { type: String, required: true },
            proficiency: { type: String, enum: ["Beginner", "Intermediate", "Expert"], default: "Intermediate" },
            yearsOfExperience: { type: Number, default: 0 },
            verified: { type: Boolean, default: false },
            verificationSource: { type: String }
        }
    ],
    
    // NEW: Experience Level
    experienceLevel: { 
        type: String, 
        enum: ["Beginner", "Intermediate", "Expert"], 
        default: "Intermediate" 
    },
    
    // NEW: What user is looking for
    lookingFor: [
        {
            type: String,
            enum: [
                "Find collaborators",
                "Mentor others",
                "Be mentored",
                "Learn new skill",
                "Build startup",
                "Open source",
                "Freelance"
            ]
        }
    ],
    
    // NEW: Portfolio Links
    portfolioLinks: {
        github: { type: String },
        linkedin: { type: String },
        portfolio: { type: String },
        behance: { type: String },
        stackoverflow: { type: String }
    },
    
    // NEW: Collaboration Status
    availableForCollaboration: { type: Boolean, default: true },
    currentProject: { type: String },
    
    // NEW: Verification Status
    isVerified: { type: Boolean, default: false },
    verificationDate: { type: Date },
    
},{timestamps: true})

const User = mongoose.model("User",userSchema);

export default User;