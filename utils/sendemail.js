const nodemailer = require("nodemailer");  // import nodemailer
const dotenv = require("dotenv");
dotenv.config();  // load environment variables from .env file
const user = require("../models/user");

// Function to send email
async function sendEmail(to, subject, text,useremail,otp) {
  // Step 1: Create a transporter (connection to email service)
  const transporter = nodemailer.createTransport({
    service: "gmail",    // using Gmail service (can also use outlook, yahoo, or SMTP)
    auth: {
      user: process.env.EMAIL_USER,  // your email address
      pass: process.env.EMAIL_PASS,  // your email password (or app password)
    },
  });

  // Step 2: Define email details
  const mailOptions = {
    from: process.env.EMAIL_USER, // who is sending the email
    to:useremail,                       // recipient email address
    subject: "Your OTP Code",             // subject line
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,                   // plain text body
  };

  // Step 3: Send the email
  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully!");
}

// Example usage
sendEmail("user@example.com", "Your OTP Code", "Your OTP is 123456");
