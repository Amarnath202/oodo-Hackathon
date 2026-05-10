'use strict';

const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer transporter using SMTP config from .env.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false, // use STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Sends a password reset email with the reset link.
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} resetToken - Raw reset token
 */
const sendPasswordResetEmail = async (to, name, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Traveloop" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Reset your Traveloop password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Reset Your Password</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your Traveloop account password.</p>
        <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" 
           style="display: inline-block; background: #4f46e5; color: white; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                  margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">
          If you did not request a password reset, please ignore this email.
        </p>
        <p style="color: #666; font-size: 12px;">
          If the button doesn't work, copy this link: ${resetUrl}
        </p>
      </div>
    `,
  });
};

/**
 * Sends a welcome email after account registration.
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 */
const sendWelcomeEmail = async (to, name) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Traveloop" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Welcome to Traveloop! 🌍',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Welcome to Traveloop, ${name}! 🌍</h2>
        <p>Your account has been created successfully.</p>
        <p>Start planning your dream trips today!</p>
        <a href="${process.env.CLIENT_URL}" 
           style="display: inline-block; background: #4f46e5; color: white; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Start Planning
        </a>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail, sendWelcomeEmail };
