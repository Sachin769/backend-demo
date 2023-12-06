require("../connections/mongodb");
const httpContext = require("express-http-context");
const bcrypt = require("bcrypt");
const {response} = require("../utils/api_response");
const dbSchema = require("../models/db_schema");
const { trusted } = require("mongoose");



module.exports.userProfileExist = async (req,resp) => {
    try{
        const filter = {
            $or:[
                {mobile_no : req.mobile_no},
                {email : req.email}
            ],
            is_active: true
        }
        const fetchQuery = await dbSchema.UserProfile.countDocuments(filter).lean();
        return fetchQuery;
    }catch(e){
        return response(500,"Error In Modalss",e.message);
    }
}

module.exports.insertNewUserRegisteration = async (req,resp) => {
    try{
        // req.password = await bcrypt.hash(req.password,+process.env.PASSWORD_COST_FACTOR);
        const insertedObject = new dbSchema.UserProfile({
            full_name : req.full_name,
            email: req.email,
            mobile_no: req.mobile_no,
            // password : req.password
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    }catch(e){
        return response(500,"Error In Modalssss",e.message);
    }
}

module.exports.updateUserOTP = async (userId,otp,resp) => {
    try{
        console.log("otp",otp,process.env.PASSWORD_COST_FACTOR);
        otp = await bcrypt.hash(otp,+process.env.PASSWORD_COST_FACTOR);
        const filter = {
            _id : userId
        }
        const update = {
            otp : otp,
            modified_date : new Date()
        }
        const options = {
            new : true
        }
        const updateQuery = await dbSchema.UserProfile.findByIdAndUpdate(filter,update,options);
        return updateQuery;
    }catch(e){
        return response(500,"Error IN Modal",e.message);
    }
}

module.exports.fetchUserProfile = async (req,resp) => {
    try{
        const filter = {
            email: req.email,
            is_active : true
        }
        const fetchQuery = await dbSchema.UserProfile.findOne(filter).lean();
        return fetchQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
} 

module.exports.fetchUserProfileViaId = async (userId,resp) => {
    try{
        const filter = {
            _id : userId
        }
        const fetchQuery = await dbSchema.UserProfile.findById(filter).lean();
        return fetchQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.updatePassword = async (req,resp) => {
    try{
        const filter = {
            _id : req.user_id
        }
        const update = {
            password: req.new_password
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.UserProfile.findByIdAndUpdate(filter, update,options);
        return updateQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.updateToken = async (userId,token,resp) => {
    try{
        const filter = {
            _id : userId
        }
        const update = {
            token : token,
            modified_date : new Date()
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.UserProfile.findByIdAndUpdate(filter,update,options);
        return updateQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}