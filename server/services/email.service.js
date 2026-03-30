const nodemailer = require('nodemailer');
let transporter = null;
let warnedEmailConfig = false;

function getTransporter() {
    if (transporter) return transporter;
    if (!process.env.EMAIL_USER || !process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REFRESH_TOKEN || !process.env.ACCESS_TOKEN) {
        if (!warnedEmailConfig) {
            console.warn("Email credentials are missing. Email notifications are disabled.");
            warnedEmailConfig = true;
        }
        return null;
    }

    transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_USER,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: process.env.ACCESS_TOKEN,
        },
    });

    return transporter;
}

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const emailTransporter = getTransporter();
        if (!emailTransporter) return false;

        await emailTransporter.sendMail({
            from: `"Dhoomchhalle" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

async function sendRegistrationEmail(userEmail, name) {
    const subject = 'Welcome to Dhoomchalle';
    const tagline = "Your trusted traveler companion";
    const text = `Hello ${name},\n\nThank you for registering at Dhoomchalle, ${tagline}.\nWe are excited to have you on board!\n\nBest regards,\nDhoomchalle Team`;
    const html = `<p>Hello ${name},</p><p>Thank you for registering at Dhoomchalle, <br/><strong>${tagline}</strong>.</p><p>We are excited to have you on board!</p><p>Best regards,<br>Dhoomchalle Team</p>`;

    return sendEmail(userEmail, subject, text, html);
}

async function sendPasswordResetEmail(userEmail, name, resetLink) {
    const subject = "Reset your Dhoomchhalle password";
    const text = `Hello ${name},\n\nWe received a request to reset your password.\nUse this link to reset it:\n${resetLink}\n\nThis link will expire in 15 minutes.\nIf you did not request this, please ignore this message.`;
    const html = `<p>Hello ${name},</p><p>We received a request to reset your password.</p><p><a href="${resetLink}" target="_blank" rel="noopener noreferrer">Reset Password</a></p><p>This link will expire in <strong>15 minutes</strong>.</p><p>If you did not request this, please ignore this message.</p>`;

    return sendEmail(userEmail, subject, text, html);
}

async function sendOTPEmail(userEmail, name, otp) {
    const subject = "Your Dhoomchhalle 2FA Authentication Code";
    const text = `Hello ${name},\n\nYour two-factor authentication code is: ${otp}\n\nThis code will expire in 10 minutes.\nIf you did not request this code, please ignore this message.`;
    const html = `<p>Hello ${name},</p><p>Your two-factor authentication code is:</p><p style="font-size: 24px; font-weight: bold; color: #ff6b35; letter-spacing: 2px;">${otp}</p><p>This code will expire in <strong>10 minutes</strong>.</p><p>If you did not request this code, please ignore this message.</p><p>Best regards,<br>Dhoomchhalle Security Team</p>`;

    return sendEmail(userEmail, subject, text, html);
}

module.exports = { sendRegistrationEmail, sendPasswordResetEmail, sendOTPEmail }
