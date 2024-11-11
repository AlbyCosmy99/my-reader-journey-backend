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
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Benvenuto!',
      text: 'TicDrive',
      html: `
        <div style="padding: 2rem; text-align: center;">
          <h1>Benvenuto nel mondo di <span style="color: #737373;">Tic</span><span style="color: #00BF63;">drive</span>!</h1>
          <p>Codice sconto: <b>TICDRIVE25</b></p>
        </div>`,
    });

    res.send({ code: verificationCode });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ error: 'Failed to send verification email.' });
  }
});

export default mailRouter;
