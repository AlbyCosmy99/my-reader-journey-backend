import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors'

const mailRouter = express.Router();

mailRouter.use(cors())

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.me.com', // iCloud SMTP server
    port: 587, // Standard SMTP port
    secure: false, // True for 465, false for other ports
    auth: {
      user: 'dinamo1999@icloud.com', // Your iCloud email
      pass: 'kgrc-sryi-dbzy-hgul', // App-specific password generated from Apple ID account page
    },
});

mailRouter.post('/send-verification', async (req, res) => {
  const { email } = req.body;
  const verificationCode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit code

  try {
    await transporter.sendMail({
      from: 'dinamo1999@icloud.com',
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${verificationCode}`,
    });

    res.send({ code: verificationCode });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ error: 'Failed to send verification email.' });
  }
});

export default mailRouter;
