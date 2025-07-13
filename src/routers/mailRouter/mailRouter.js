import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";

const senderEmail = "albu.cosminandrei.1999@gmail.com";

const mailRouter = express.Router();

mailRouter.use(cors());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: senderEmail,
    pass: "czlf lhpa lsxw fzfd",
  },
});

mailRouter.post("/send-verification", async (req, res) => {
  const { email } = req.body;
  const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code

  try {
    await transporter.sendMail({
      from: senderEmail,
      to: email,
      subject: "Your Verification Code",
      text: `Welcome to My Reader Journey!\n\nYour verification code is: ${verificationCode}\n\nHappy reading!`,
      html: `
        <div style="padding: 2rem; text-align: center; font-family: Arial, sans-serif;">
          <h1 style="color: #333;">Welcome to My Reader Journey!</h1>
          <p style="font-size: 1.1rem; color: #555;">
            We're excited to have you join our community of book lovers.
          </p>
          <p style="margin-top: 1.5rem; font-size: 1.2rem;">
            📘 <strong>Your verification code:</strong>
            <br />
            <span style="font-size: 1.8rem; color: #007BFF;">${verificationCode}</span>
          </p>
          <p style="margin-top: 2rem; font-size: 1rem; color: #888;">
            Happy reading!
          </p>
        </div>
      `,
    });

    res.send({ success: "Code sent to " + email + " email" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ error: "Failed to send verification email." });
  }
});

export default mailRouter;
