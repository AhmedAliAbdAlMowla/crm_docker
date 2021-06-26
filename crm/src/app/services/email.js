"use strict"
let transporter = require("../config/email");

/**
 * @desc      Send email 
 * @param     subject, text, to
 */
exports.sendMail = async (subject, text, to) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    subject,
    text,
    to,
  };
//   subject: "Sending code to confirm change password :",
  await transporter.sendMail(mailOptions);
};
