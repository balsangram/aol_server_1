import nodemailer from "nodemailer";

export const sendmail = (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "lipuparhi008@gmail.com",
      pass: "dnqlipboqrinhmra",
    },
  });

  const mailOptions = {
    from: "balsangram1@gmail.com",
    to: `${email}`,
    subject: "Food Co",
    text: `<p>Your otp is - ${otp} , it only valid for 5 minitues</p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error.message);
    }
    console.log("Email Sent: " + info);
  });
};
