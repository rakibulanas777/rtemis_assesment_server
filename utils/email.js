const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) Create a transporter
  // const transporter = nodemailer.createTransport({
  //   host: process.env.EMAIL_HOST,
  //   port: process.env.EMAIL_PORT,
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  // });

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "rakibulanas777@gmail.com",
      pass: "uqkqyhusqtofkwbh",
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: "Rakibul Islam Anas <rakibulanas777@gmail.com>",
    to: options.email,
    subject: options.subject,
    html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; border: 2px solid #007bff; padding: 20px; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="text-align: center; color: #007bff;">Your OTP Code</h2>
        <p style="font-size: 16px; text-align: center;">Hello, <strong>${options.name}</strong>!</p>
        <p style="font-size: 16px; text-align: center;">Use the following One-Time Password (OTP) to complete your verification:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; color: #ff6b6b; padding: 10px 20px; background-color: #fff3f3; border: 1px solid #ff6b6b; border-radius: 5px;">${options.otp}</span>
        </div>
        <p style="font-size: 14px; text-align: center;">This OTP is valid for the next 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #555; text-align: center;">If you did not request this OTP, please ignore this email or contact support immediately.</p>
        <p style="font-size: 12px; color: #555; text-align: center;">Thanks, <br/> The Room Booking Team</p>
      </div>
    </div>
  `,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
