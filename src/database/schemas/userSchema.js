import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    emailVerified: {
        type: Boolean,
        required: false,
        default: false
    },
    password: {
        type:String,
        required: true
    },
    passwordResetCodeHash: {
        type: String,
        default: null
    },
    passwordResetExpiresAt: {
        type: Date,
        default: null
    },
    passwordResetSessionHash: {
        type: String,
        default: null
    },
    passwordResetSessionExpiresAt: {
        type: Date,
        default: null
    }
})

export const UserModel = mongoose.model("users",userSchema)
