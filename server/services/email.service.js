const nodemailer = require('nodemailer');
/**
 * Check for required environment variables before creating the transporter. This ensures that we catch configuration issues early and avoid runtime errors when trying to send emails.
 */
if (!process.env.EMAIL_USER || !process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REFRESH_TOKEN || !process.env.ACCESS_TOKEN) {
    throw new Error("Email credentials are missing in environment variables");
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN,
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Dhoomchhalle" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

async function sendRegistrationEmail(userEmail, name) {
    const subject = 'Welcome to Dhoomchalle';
    const tagline = "Your trusted traveler companion";
    const text = `Hello ${name},\n\nThank you for registering at Dhoomchalle, ${tagline}.\nWe are excited to have you on board!\n\nBest regards,\nDhoomchalle Team`;
    const html = `<p>Hello ${name},</p><p>Thank you for registering at Dhoomchalle, <br/><strong>${tagline}</strong>.</p><p>We are excited to have you on board!</p><p>Best regards,<br>Dhoomchalle Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

module.exports = { sendRegistrationEmail }