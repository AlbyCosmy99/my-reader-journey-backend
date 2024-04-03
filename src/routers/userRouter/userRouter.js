import express from 'express';
import { UserModel } from '../../database/schemas/userSchema.js';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config';
import mailRouter from '../mailRouter/mailRouter.js'
import tokenAuth from '../../middlewares/tokenAuth.js'
import bookRouter from '../bookRouter/bookRouter.js';

const userRouter = express.Router();

userRouter.use('/mails', mailRouter)
userRouter.use('/books', bookRouter)

userRouter.post("/register", async (req, res) => {
    try {
        const newUser = new UserModel(req.body);
        newUser.password = await bcrypt.hash(newUser.password, 10)
        await newUser.save();

        const payload = {
            id: newUser._id,
            name: newUser.name,
            surname: newUser.surname,
            email: newUser.email,
            emailVerified: newUser.emailVerified
        } 
        
        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });
        
        res.status(201).json({jwt: token})

    } catch (err) {
        res.status(400).json({
            "error": "Cannot save to db.",
            "details": err.message 
        });
    }
});

userRouter.post('/login', async (req,res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({email: email })

        if(!user) {
            return res.status(404).json({ message: "User not found" });
            
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const payload = {
            id: user._id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            emailVerified: user.emailVerified
        } 
        
        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });
        
        res.status(201).json({jwt: token})
    }
    catch(err) {
        res.status(400).json({
            "error": "Invalid credentials.",
            "details": err.message 
        });
    }
})

userRouter.post('/change-password', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.password = await bcrypt.hash(password, 10);
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
        res.status(400).json({
            "error": "Unable to change password.",
            "details": err.message 
        });
    }
});

userRouter.get('/',tokenAuth, (req,res) => {
    return res.status(200).json(req.payload)
})

userRouter.get('/', (req,res) => {
    return res.status(200).json("users ok")
})

export default userRouter;