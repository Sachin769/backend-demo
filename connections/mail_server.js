"use strict"
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: process.env.GMAIL_HOST,
    port: process.env.GMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.SENDER_GMAIL_ID,
        pass: process.env.SENDER_GMAIL_PASSWORD,
    },
});

// checking connection
transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    }else if(success){
        console.log("Mail Server is Running");
    }
});

module.exports = transporter;