import nodemailer from "nodemailer";

export const sendmail = (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: true,
    requireTLS: true,
    auth: {
      user: "balsangram1@gmail.com",
      pass: "hzkjrlrfyuyohfal",
    },
  });

  const mailOptions = {
    from: '"Art of Living" <balsangram1@gmail.com>',
    to: email,
    subject: "Your Art of Living OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #007BFF;">Welcome to Art of Living!</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h3 style="color: #28a745;">${otp}</h3>
        <p>This OTP is valid for <strong>5 minutes</strong>.</p>
        <hr />
        <p style="font-size: 12px; color: #777;">
          If you did not request this OTP, please ignore this email. <br/>
          © Art of Living, All rights reserved.
        </p>
      </div>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Error sending email:", error.message);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};
