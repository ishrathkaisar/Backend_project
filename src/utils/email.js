const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail", // or 'hotmail', 'yahoo', or use SMTP config
    auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // app password (not normal password) 
    },
});

async function sendEmail({ to, subject, html }) {
    RETURN transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    });
}


module.exports = { sendEmail };