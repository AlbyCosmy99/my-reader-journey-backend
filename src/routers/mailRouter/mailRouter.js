import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import "dotenv/config";

const normalizeEnvValue = (value = "") =>
  String(value).trim().replace(/^['"]|['"]$/g, "");
const normalizeMailPassword = (value = "") =>
  normalizeEnvValue(value).replace(/\s+/g, "");

const rawSenderEmail = process.env.MAIL_USER || process.env.MAIL;
const rawSenderPassword =
  process.env.MAIL_PASS ||
  process.env.MAIL_PASSWORD ||
  process.env.MAIL_APP_PASSWORD;
const senderEmail = normalizeEnvValue(rawSenderEmail);
const senderPassword = normalizeMailPassword(rawSenderPassword);

const mailRouter = express.Router();
const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

mailRouter.use(cors());

const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  maxConnections: 1,
  maxMessages: 50,
  auth: {
    user: senderEmail,
    pass: senderPassword,
  },
});

const buildVerificationEmail = (recipientEmail, verificationCode) => ({
  from: senderEmail,
  to: recipientEmail,
  subject: "Your Verification Code",
  text: `My Reader Journey\n\nYour verification code is: ${verificationCode}\n\nHappy reading!`,
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

if (!senderEmail || !senderPassword) {
  const missing = [];
  if (!senderEmail) missing.push("MAIL_USER (or MAIL)");
  if (!senderPassword)
    missing.push("MAIL_PASS (or MAIL_PASSWORD / MAIL_APP_PASSWORD)");
  console.warn(
    `Mail env missing: ${missing.join(
      ", "
    )}. /send-verification will return 500 until configured.`
  );
}

if (
  rawSenderPassword &&
  normalizeEnvValue(rawSenderPassword) !== senderPassword
) {
  console.log("MAIL_PASS normalized by removing spaces for Gmail app password.");
}

if (senderEmail && senderPassword) {
  void transporter.verify().then(() => {
    console.log(`Mail transporter ready for ${senderEmail}`);
  }).catch((error) => {
    console.error("Mail transporter verification failed:", error);
  });
}

mailRouter.post("/send-verification", async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body?.email);
  const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code

  if (!normalizedEmail) {
    return res.status(400).send({ error: "Valid email is required." });
  }

  try {
    if (!senderEmail || !senderPassword) {
      return res.status(500).send({
        error:
          "Mail service is not configured. Set MAIL_USER + MAIL_PASS (or MAIL + MAIL_PASS).",
      });
    }

    const mailOptions = buildVerificationEmail(
      normalizedEmail,
      verificationCode
    );

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", {
      to: normalizedEmail,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      messageId: info.messageId,
    });

    res.send({ code: verificationCode });
  } catch (error) {
    console.error("Error sending email:", error);
    const details = error?.message || "Unknown error";
    if (process.env.NODE_ENV === "production") {
      return res.status(500).send({ error: "Failed to send verification email." });
    }
    return res.status(500).send({
      error: "Failed to send verification email.",
      details,
    });
  }
});

export default mailRouter;
