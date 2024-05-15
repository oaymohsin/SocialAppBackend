import nodemailer from 'nodemailer'
import { apiError } from './apiError.js';



export const sendEmail = async (email,code) => {
  try {
    // Configure transporter with app password (replace with yours)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mohsinmaken3@gmail.com',
        pass: 'moyg ywls uvfo ujji' // Replace with generated app password
      }
    });

    const mailOptions = {
      from: 'mohsinmaken3@gmail.com',
      to: email,
      subject: 'Password Reset Confirmation',
      html: `<h1>Hello!</h1>
              <p>You have requested to reset your password.</p>
              <p>Your confirmation code is: ${code}</p>
              <p>Please click this link to reset your password: https://your-app.com/reset-password/user_id</p>
              <p>This code will expire in 15 minutes.</p>`
    };

    // Send email and handle success or error asynchronously
    const info = await transporter.sendMail(mailOptions);
    // console.log('Email sent successfully:', info);

    // Return info if needed for further processing (optional)
    return info;
  } catch (error) {
    console.error('Error sending email:', error);

    // Implement error handling (e.g., log error, send error notification)
    return apiError(error.message); // Example using apiError function (replace with your error handling logic)
  }
};
