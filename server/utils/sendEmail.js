const nodemailer = require("nodemailer");

const getSmtpHost = () => {
  const host = process.env.SMTP_HOST?.trim();
  if (host) return host;
  const user = process.env.SMTP_USER?.trim() || "";
  if (user.endsWith("@gmail.com")) return "smtp.gmail.com";
  return "";
};

const isEmailConfigured = () => {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "");
  return Boolean(getSmtpHost() && user && pass);
};

const createTransporter = () => {
  const host = getSmtpHost();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "");
  const isGmail = host === "smtp.gmail.com" || process.env.SMTP_SERVICE === "gmail";

  if (isGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!isEmailConfigured()) {
    return { sent: false, reason: "SMTP not configured" };
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error("[Halo] Email send failed:", err.message);
    return { sent: false, reason: err.message };
  }
};

module.exports = { sendEmail, isEmailConfigured };
