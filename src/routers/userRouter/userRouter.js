import express from 'express';
import { UserModel } from '../../database/schemas/userSchema.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config';
import tokenAuth from '../../middlewares/tokenAuth.js'
import bookRouter from '../bookRouter/bookRouter.js';
import {
    getMailConfigurationError,
    isMailConfigured,
    sendPasswordResetCodeEmail,
    verifyMailTransport,
} from '../../services/mailService.js';

const userRouter = express.Router();
const PASSWORD_RESET_CODE_TTL_MS = 10 * 60 * 1000;
const PASSWORD_RESET_SESSION_TTL_MS = 15 * 60 * 1000;
const PASSWORD_RESET_GENERIC_MESSAGE =
    'If an account exists for this email, a verification code has been sent.';
const PASSWORD_RESET_HASH_SECRET = process.env.SECRET_KEY || 'password-reset-secret';

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();
const normalizeCode = (code = '') => String(code).trim();

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const hashSecretValue = value =>
    crypto
        .createHash('sha256')
        .update(`${String(value)}:${PASSWORD_RESET_HASH_SECRET}`)
        .digest('hex');

const safeEqualHash = (left, right) => {
    if (!left || !right || left.length !== right.length) return false;
    return crypto.timingSafeEqual(Buffer.from(left), Buffer.from(right));
};

const clearPasswordResetState = user => {
    user.passwordResetCodeHash = null;
    user.passwordResetExpiresAt = null;
    user.passwordResetSessionHash = null;
    user.passwordResetSessionExpiresAt = null;
};

const generateVerificationCode = () =>
    String(crypto.randomInt(100000, 1000000));

const generateResetSessionToken = () =>
    crypto.randomBytes(32).toString('hex');

const findUserByEmailInsensitive = async email => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return null;

    return UserModel.findOne({
        email: {
            $regex: `^${escapeRegex(normalizedEmail)}$`,
            $options: 'i'
        }
    });
};

void verifyMailTransport().catch(error => {
    console.error('Mail transport verification failed:', error);
});

userRouter.use('/books', bookRouter)

userRouter.post("/register", async (req, res) => {
    try {
        const normalizedEmail = normalizeEmail(req.body.email);
        const { name, surname, password } = req.body;
        if (!normalizedEmail) {
            return res.status(400).json({
                error: "Valid email is required"
            });
        }

        const existingUser = await findUserByEmailInsensitive(normalizedEmail);
        if (existingUser) {
            return res.status(400).json({
                error: "User already exists with this email"
            });
        }
        const newUser = new UserModel({
            name,
            surname,
            email: normalizedEmail
        });
        newUser.password = await bcrypt.hash(password, 10)
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
        const user = await findUserByEmailInsensitive(email);

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

userRouter.post('/password-reset/request', async (req, res) => {
    try {
        const normalizedEmail = normalizeEmail(req.body.email);

        if (!normalizedEmail) {
            return res.status(400).json({
                error: 'Valid email is required.',
            });
        }

        if (!isMailConfigured()) {
            return res.status(500).json({
                error: getMailConfigurationError(),
            });
        }

        const user = await findUserByEmailInsensitive(normalizedEmail);
        if (!user) {
            return res.status(200).json({
                message: PASSWORD_RESET_GENERIC_MESSAGE,
            });
        }

        const verificationCode = generateVerificationCode();
        clearPasswordResetState(user);
        user.passwordResetCodeHash = hashSecretValue(verificationCode);
        user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_CODE_TTL_MS);
        await user.save();

        try {
            const info = await sendPasswordResetCodeEmail({
                recipientEmail: normalizedEmail,
                verificationCode,
            });

            console.log('Password reset email sent:', {
                to: normalizedEmail,
                accepted: info.accepted,
                rejected: info.rejected,
                response: info.response,
                messageId: info.messageId,
            });

            return res.status(200).json({
                message: PASSWORD_RESET_GENERIC_MESSAGE,
            });
        } catch (mailError) {
            clearPasswordResetState(user);
            await user.save();
            throw mailError;
        }
    } catch (err) {
        console.error('Password reset request failed:', err);
        if (process.env.NODE_ENV === 'production') {
            return res.status(502).json({
                error: 'Unable to send reset email right now. Please try again later.',
            });
        }
        return res.status(502).json({
            "error": "Unable to send reset email right now.",
            "details": err.message 
        });
    }
});

userRouter.post('/password-reset/verify', async (req, res) => {
    try {
        const normalizedEmail = normalizeEmail(req.body.email);
        const verificationCode = normalizeCode(req.body.code);

        if (!normalizedEmail || !/^\d{6}$/.test(verificationCode)) {
            return res.status(400).json({
                error: 'Email and 6-digit verification code are required.',
            });
        }

        const user = await findUserByEmailInsensitive(normalizedEmail);
        const storedCodeHash = user?.passwordResetCodeHash;
        const expiresAt = user?.passwordResetExpiresAt;
        const isCodeExpired = !expiresAt || expiresAt.getTime() < Date.now();
        const providedCodeHash = hashSecretValue(verificationCode);

        if (
            !user ||
            !storedCodeHash ||
            isCodeExpired ||
            !safeEqualHash(storedCodeHash, providedCodeHash)
        ) {
            return res.status(400).json({
                error: 'Invalid or expired verification code.',
            });
        }

        const resetToken = generateResetSessionToken();
        user.passwordResetCodeHash = null;
        user.passwordResetExpiresAt = null;
        user.passwordResetSessionHash = hashSecretValue(resetToken);
        user.passwordResetSessionExpiresAt = new Date(
            Date.now() + PASSWORD_RESET_SESSION_TTL_MS
        );
        await user.save();

        return res.status(200).json({
            resetToken,
        });
    } catch (err) {
        return res.status(400).json({
            error: 'Unable to verify reset code.',
            details: err.message,
        });
    }
});

userRouter.post('/password-reset/confirm', async (req, res) => {
    try {
        const normalizedEmail = normalizeEmail(req.body.email);
        const resetToken = String(req.body.resetToken || '').trim();
        const password = String(req.body.password || '');

        if (!normalizedEmail || !resetToken || password.length < 8) {
            return res.status(400).json({
                error: 'Email, reset token and a password of at least 8 characters are required.',
            });
        }

        const user = await findUserByEmailInsensitive(normalizedEmail);
        const storedSessionHash = user?.passwordResetSessionHash;
        const sessionExpiresAt = user?.passwordResetSessionExpiresAt;
        const isSessionExpired =
            !sessionExpiresAt || sessionExpiresAt.getTime() < Date.now();
        const providedSessionHash = hashSecretValue(resetToken);

        if (
            !user ||
            !storedSessionHash ||
            isSessionExpired ||
            !safeEqualHash(storedSessionHash, providedSessionHash)
        ) {
            return res.status(400).json({
                error: 'Invalid or expired reset session.',
            });
        }

        user.password = await bcrypt.hash(password, 10);
        clearPasswordResetState(user);
        await user.save();

        return res.status(200).json({
            message: 'Password changed successfully',
        });
    } catch (err) {
        return res.status(400).json({
            "error": "Unable to change password.",
            "details": err.message 
        });
    }
});

userRouter.get('/',tokenAuth, (req,res) => {
    return res.status(200).json(req.payload)
})

userRouter.get('/test', (req,res) => {
    return res.status(200).json("users ok")
})

export default userRouter;
