// Import the necessary libraries
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_TRAP_HOST,
  port: 587,
  auth: {
    user: process.env.MAIL_TRAP_USER,
    pass: process.env.MAIL_TRAP_PASSWORD,
  },
});

const sendVerificationLink = async (to, from, subject, emailBody) => {
  try {
    const renderedHtml = await ejs.renderFile(
      path.join(__dirname, "../../views/email-templates/verify-email.ejs"),
      {
        subject: subject,
        emailBody: emailBody,
      }
    );

    const mailOptions = {
      from: from,
      to: to,
      subject: "Verify Your Account",
      html: renderedHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true;
  } catch (error) {
    console.log("Error:", error);
    return false;
  }
};

module.exports = {
  sendVerificationLink,
};