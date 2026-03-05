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
    }
})

export const UserModel = mongoose.model("users",userSchema)
