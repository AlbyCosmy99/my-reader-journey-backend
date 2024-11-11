import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors'

const mailRouter = express.Router();

mailRouter.use(cors())

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'newsletter.ticdrive@gmail.com',
    pass: 'zlfz fkxz lihh zcsf',
  },
});

mailRouter.post('/send-verification', async (req, res) => {
  const { email } = req.body;
  const verificationCode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit code

  try {
    await transporter.sendMail({
      from: 'newsletter.ticdrive@gmail.com',
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
