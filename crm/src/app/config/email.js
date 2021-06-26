"use strict"
const nodemailer = require("nodemailer");
/**
 * @desc    Config sender
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports =  transporter;
