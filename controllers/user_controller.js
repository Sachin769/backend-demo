"use strict"
const joi = require("joi");
const jwt = require("jsonwebtoken");
const httpContext = require("express-http-context");
const bcrypt = require("bcrypt");
const haModel = require("../models/ha_model");
const response = require("../utils/api_response").response;
const sendEmail = require("./send_email");


let dataSet = {};

module.exports.verifyUserToken = async (req, resp, next) => {
    try {
        const access_token = req.headers.authorization;
        if (!(access_token)) {
            dataSet = response(422, 'Authorization code missing!', request.headers.authorization);
            resp.status(422).json(dataSet);
            return;
        }
        const validateToken = await jwt.verify(req.headers.authorization, process.env.ACCESS_TOKEN_SALT);
        const fetchToken = await haModel.fetchUserProfileViaId(validateToken.user_id);
        if (fetchToken.code === 500) {
            resp.status(500).json(fetchToken);
            return;
        }
        if (fetchToken.access_token !== access_token) {
            dataSet = response(422, "Token Is Invalid", req.headers.authorization);
            resp.status(422).json(dataSet);
            return;
        }
        httpContext.set('loginDetails', validateToken);
        next();
    } catch (e) {
        dataSet = response(422, "Error In Authorization Code", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.userRegisteration = async (req, resp) => {
    try {
        console.log("req.body",req.body);
        const validatedUserRegisteration = await validateUserRegisteration.validateAsync(req.body);
        const checkAlreadyExistUser = await haModel.userProfileExist(req.body);
        if (checkAlreadyExistUser?.code === 500) {
            return resp.status(500).json(checkAlreadyExistUser);
        }
        if(checkAlreadyExistUser){
            if(checkAlreadyExistUser.email === req.body.email && checkAlreadyExistUser.mobile_no !== req.body.mobile_no){
                dataSet = response(422,"Already Email Exist");
                return resp.status(422).json(dataSet);
            }
            if(checkAlreadyExistUser.mobile_no === req.body.mobile_no && checkAlreadyExistUser.email !== req.body.email){
                dataSet = response(422,"Already Mobile No. Exist");
                return resp.status(422).json(dataSet);
            }
            if (checkAlreadyExistUser.mobile_no === req.body.mobile_no && checkAlreadyExistUser.email === req.body.email) {
                dataSet = response(422, "Already Exists User with Same mobile no and Email");
                return resp.status(422).json(dataSet);
            }
        }
        const insertUserRegisteration = await haModel.insertNewUserRegisteration(req.body);
        if (insertUserRegisteration.code === 500) {
            return resp.status(500).json(insertUserRegisteration);
        }
        const timestamp = Date.now(); // Current timestamp in milliseconds
        const random = Math.floor(Math.random() * 10000); // Random number between 0 and 9999
        const uniqueNumber = (timestamp + random) % 10000; // Combine and limit to 4 digits
        const fourDigitOTP = uniqueNumber.toString().padStart(4, '0');
        const otp = fourDigitOTP;
        const sendOTPEmail = await sendEmail.sendOTPVerification(otp, insertUserRegisteration.email);
        if (sendOTPEmail.code === 550) {
            return resp.status(550).json(sendOTPEmail);
        }
        const updateUserOTP = await haModel.updateUserOTP(insertUserRegisteration._id, otp);
        if (updateUserOTP.code === 500) {
            return resp.status(500).json(updateUserOTP);
        }
        dataSet = response(200, "OTP Verification Sent To Your Registered Email", { user_id: insertUserRegisteration._id });
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error In Controller", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.userLogin = async (req, resp) => {
    try {
        const validatedUserLogin = await validateUserLogin.validateAsync(req.body);
        const fetchUserProfile = await haModel.fetchUserProfile(req.body);
        if ((!fetchUserProfile) || req.body.email !== fetchUserProfile.email) {
            dataSet = response(422, "Invalid Email");
            return resp.status(422).json(dataSet);
        }
        if (fetchUserProfile.code === 500) {
            return resp.status(500).json(fetchUserProfile);
        }
        // const comparedPassword = await bcrypt.compare(req.body.password,fetchUserProfile.password);
        // if(comparedPassword === false){
        //     dataSet = response(422,"Invalid Password");
        //     return resp.status(422).json(dataSet);
        // }
        // const token = jwt.sign({user_id : fetchUserProfile._id, user_name: fetchUserProfile.user_name,email: fetchUserProfile.email,mobile_no: fetchUserProfile.mobile_no},process.env.ACCESS_TOKEN_SALT);
        // const updateToken = await haModel.updateToken(fetchUserProfile._id,token);
        // if(updateToken.code === 500){
        //     return resp.status(500).json(updateToken);
        // }
        const timestamp = Date.now(); // Current timestamp in milliseconds
        const random = Math.floor(Math.random() * 10000); // Random number between 0 and 9999
        const uniqueNumber = (timestamp + random) % 10000; // Combine and limit to 4 digits
        const fourDigitOTP = uniqueNumber.toString().padStart(4, '0');
        const otp = fourDigitOTP;
        const sendOTPEmail = await sendEmail.sendOTPVerification(otp, fetchUserProfile.email);
        if (sendOTPEmail.code === 550) {
            return resp.status(550).json(sendOTPEmail);
        }
        const updateUserOTP = await haModel.updateUserOTP(fetchUserProfile._id, otp);
        if (updateUserOTP.code === 500) {
            return resp.status(500).json(updateUserOTP);
        }
        dataSet = response(200, "OTP Verification Sent To Your Registered Email", { user_id: fetchUserProfile._id });
        resp.status(200).json(dataSet);
        // dataSet = response(200, "Successfully Login", { token });
        // resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error In Modal", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.verifyUserOTP = async (req, resp) => {
    try {
        const validatedUserOTP = await validateUserOTP.validateAsync(req.body);
        const fetchUserProfile = await haModel.fetchUserProfile(req.body);
        if (fetchUserProfile?.code === 500) {
            return resp.status(500).json(fetchUserProfile);
        }
        if (!fetchUserProfile) {
            dataSet = response(422, "Invalid Email");
            return resp.status(422).json(dataSet);
        }
        const comparedOTP = await bcrypt.compare(req.body.otp,fetchUserProfile.otp);
        if(!comparedOTP){
            dataSet = response(200,"Invalid OTP");
            return resp.status(200).json(dataSet);
        }
        if (comparedOTP) {
            const token = await jwt.sign({ user_id: fetchUserProfile._id, full_name: fetchUserProfile.full_name, email: fetchUserProfile.email, mobile_no: fetchUserProfile.mobile_no }, process.env.ACCESS_TOKEN_SALT);
            const updateToken = await haModel.updateToken(fetchUserProfile._id, token);
            if (updateToken.code === 500) {
                return resp.status(500).json(updateToken);
            }
            dataSet = response(200, "Login Successfully",{token,user_id:fetchUserProfile._id});
            resp.status(200).json(dataSet);
        }
    } catch (e) {
        dataSet = response(422, "Error In Modal", e.message);
        resp.status(422).json(dataSet);
    }
}




module.exports.addDeviceModel = async (req,resp) => {
    try{
        const validatedDeviceModal = await validateDeviceModal.validateAsync(req.body);
        const addDeviceModal = await haModel.addDeviceModal(req.body);
        if(addDeviceModal.code === 500){
            return resp.status(500).json(addDeviceModal);
        }
        dataSet = response(200,"Device Modal Added Successfully");
        resp.status(200).json(dataSet);
    }catch(e){
        dataSet = response(422,"Error In Modal",e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.insertDeviceIP = async (req,resp) => {
    try{
        const validatedDeviceIP = await validateDeviceIP.validateAsync(req.body);
        const insertDeviceIP = await haModel.insertDeviceIP(req.body);
        if(insertDeviceIP.code === 500){
            return resp.status(500).json(insertDeviceIP);
        }
        dataSet = response(200,"Inserted Device Successfully");
        resp.status(200).json(dataSet);
    }catch(e){
        dataSet = response(422,"Error In Modal",e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.fetchAllDeviceInfo = async (req,resp) => {
    try{
        const fetchAllDeviceInfo = await haModel.fetchAllDeviceInfo();
        if(fetchAllDeviceInfo.code === 500){
            return resp.status(500).json(fetchAllDeviceInfo);
        }
        dataSet = response(200,"All Device IP Success",fetchAllDeviceInfo);
        resp.status(200).json(dataSet);
    }catch(e){
        dataSet = response(422,"Error In Controller",e.message);
        resp.status(422).json(dataSet);
    }
}



module.exports.forgetPassword = async (req, resp) => {
    try {
        const validatedForgetPassword = await validateForgetPassword.validateAsync(req.body);
        const fetchUserProfile = await haModel.fetchUserProfile(req.body);
        if (fetchUserProfile.code === 500) {
            return resp.status(500).json(fetchUserProfile);
        }
        if (fetchUserProfile.length <= 0) {
            dataSet = response(422, "Invalid Email");
            return resp.status(422).json(dataSet);
        }
        dataSet = response(200, "Forget Password Email Sent To Your Email");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error In Modal", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.updatePassword = async (req, resp) => {
    try {
        const validatedUpdatePassword = await validateUpdatePassword.validateAsync(req.body);
        const updatePassword = await haModel.updatePassword(req.body);
        if (updatePassword.code === 500) {
            return resp.status(500).json(updatePassword);
        }
        dataSet = response(200, "Password Update Successfully");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error In Controller", e.message);
        resp.status(422).json(dataSet);
    }
}

const validateUserRegisteration = joi.object({
    full_name: joi.string().required(),
    email: joi.string().required(),
    mobile_no: joi.string().length(10).required(),
    // password: joi.string().required()
})

const validateUserLogin = joi.object({
    email: joi.string().required(),
    // password: joi.string().required()
})

const validateUserOTP = joi.object({
    otp: joi.string().required(),
    email: joi.string().required()
})

const validateForgetPassword = joi.object({
    email: joi.string().email().required()
})

const validateUpdatePassword = joi.object({
    user_id: joi.string().required(),
    new_password: joi.string().required()
})

const validateDeviceModal = joi.object({
    device_model : joi.string().required()
})

const validateDeviceIP = joi.object({
    device_id : joi.string().required(),
    device_ip : joi.string().required()
})