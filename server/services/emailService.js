const nodeMailer = require('nodemailer');

const sendEmail = async({to, subject, message}) => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
        throw new Error("Email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD in server/.env");
    }

    try{
        const transporter = nodeMailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: Number(SMTP_PORT) === 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASSWORD,
            },
        });

        const mailOptions = {
            from: SMTP_USER,
            to,
            subject,
            html: message,
        }
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch(error) {
        throw new Error(error.message || "Cannot send email")
    }
}

module.exports = sendEmail;
