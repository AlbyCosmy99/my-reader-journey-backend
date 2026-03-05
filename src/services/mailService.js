import nodemailer from "nodemailer";
import "dotenv/config";

const normalizeEnvValue = (value = "") =>
  String(value).trim().replace(/^['"]|['"]$/g, "");

const normalizeMailPassword = (value = "") =>
  normalizeEnvValue(value).replace(/\s+/g, "");

const senderEmail = normalizeEnvValue(process.env.MAIL_USER || process.env.MAIL);
const senderPassword = normalizeMailPassword(
  process.env.MAIL_PASS ||
    process.env.MAIL_PASSWORD ||
    process.env.MAIL_APP_PASSWORD
);
const resendApiKey = normalizeEnvValue(process.env.RESEND_API_KEY);
const configuredProvider = normalizeEnvValue(process.env.MAIL_PROVIDER).toLowerCase();
const mailProvider = configuredProvider || (resendApiKey ? "resend" : "smtp");
const mailFrom = normalizeEnvValue(process.env.MAIL_FROM) || senderEmail;
const smtpHost = normalizeEnvValue(process.env.SMTP_HOST) || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure = String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";
const mailTimeoutMs = Number(process.env.MAIL_TIMEOUT_MS || 10000);

const transporter =
  mailProvider === "smtp"
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        pool: true,
        maxConnections: 1,
        maxMessages: 50,
        connectionTimeout: mailTimeoutMs,
        greetingTimeout: mailTimeoutMs,
        socketTimeout: mailTimeoutMs,
        auth: {
          user: senderEmail,
          pass: senderPassword,
        },
      })
    : null;

const withTimeout = async (promiseFactory, timeoutMs, timeoutMessage) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  try {
    return await Promise.race([promiseFactory(), timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
};

export const isMailConfigured = () => {
  if (mailProvider === "resend") {
    return Boolean(resendApiKey && mailFrom);
  }

  return Boolean(senderEmail && senderPassword);
};

export const getMailConfigurationError = () => {
  if (mailProvider === "resend") {
    return "Mail service is not configured. Set RESEND_API_KEY and MAIL_FROM.";
  }

  return "Mail service is not configured. Set MAIL_USER + MAIL_PASS (or MAIL + MAIL_PASS).";
};

export const verifyMailTransport = async () => {
  if (!isMailConfigured()) {
    console.warn(getMailConfigurationError());
    return;
  }

  if (mailProvider === "resend") {
    console.log("Mail provider ready: resend");
    return;
  }

  await withTimeout(
    () => transporter.verify(),
    mailTimeoutMs,
    `SMTP verification timed out after ${mailTimeoutMs}ms`
  );
  console.log(`Mail provider ready: smtp (${senderEmail})`);
};

const sendViaResend = async ({to, subject, text, html}) => {
  if (typeof fetch !== "function") {
    throw new Error("Global fetch is unavailable. Use Node 18+ or SMTP mail.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), mailTimeoutMs);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: mailFrom,
        to: [to],
        subject,
        text,
        html,
      }),
      signal: controller.signal,
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        body?.message || body?.error || `Resend request failed with ${response.status}`
      );
    }

    return {
      accepted: [to],
      rejected: [],
      response: `resend:${body.id || response.status}`,
      messageId: body.id || null,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

const sendViaSmtp = async ({to, subject, text, html}) =>
  withTimeout(
    () =>
      transporter.sendMail({
        from: mailFrom,
        to,
        subject,
        text,
        html,
      }),
    mailTimeoutMs,
    `SMTP send timed out after ${mailTimeoutMs}ms`
  );

export const sendMail = async ({to, subject, text, html}) => {
  if (!isMailConfigured()) {
    throw new Error(getMailConfigurationError());
  }

  if (mailProvider === "resend") {
    return sendViaResend({to, subject, text, html});
  }

  return sendViaSmtp({to, subject, text, html});
};

export const sendPasswordResetCodeEmail = async ({
  recipientEmail,
  verificationCode,
}) => {
  return sendMail({
    to: recipientEmail,
    subject: "My Reader Journey password reset code",
    text: `My Reader Journey\n\nYour password reset code is: ${verificationCode}\n\nThe code expires in 10 minutes.`,
    html: `
      <div style="padding: 2rem; text-align: center; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">My Reader Journey</h1>
        <p style="font-size: 1.1rem; color: #555;">
          Use this verification code to reset your password.
        </p>
        <p style="margin-top: 1.5rem; font-size: 1.2rem;">
          <strong>Your verification code:</strong>
          <br />
          <span style="font-size: 1.8rem; color: #007BFF;">${verificationCode}</span>
        </p>
        <p style="margin-top: 2rem; font-size: 1rem; color: #888;">
          This code expires in 10 minutes.
        </p>
      </div>
    `,
  });
};
