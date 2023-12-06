"use strict"
const mailServer = require("../connections/mail_server");
const response = require("../utils/api_response").response;


let dataSet = {}
module.exports.sendOTPVerification = async (otp,recieverEmail, resp) => {
    try {
        let sendMessageBody = {
            from: process.env.SENDER_GMAIL_ID,
            to: recieverEmail,
            subject: "Home-Automation Email Verification",
            html: `To authenticate, Please use the following One Time Password (OTP):
                                             <b>${otp}</b>
            Don't share this OTP with anyone. Our customer service team will never ask you for your password, OTP, credit card, or banking info.
            We hope to see you again soon.`,
        }
        const sendEmail = await mailServer.sendMail(sendMessageBody);
        return sendEmail;
    } catch (e) {
        return response(550,"Email Server Error",e.message);
    }
}