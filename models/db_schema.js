const mongoose = require("mongoose");

const {dbStatus} = require("../config");
const Schema = mongoose.Schema;


const userProfile = new Schema({
    full_name : {type: String, required: true},
    email : {type: String, required: true},
    mobile_no: {type: String, required: true},
    otp: {type: String, required: false},
    // password: {type: mongoose.Types.ObjectId, required: true},
    added_date : {type: Date, required: true, default:()=>new Date()},
    modified_date: {type: Date, required: true, default:()=>new Date()},
    status : {type: String, required: true, default: dbStatus.active},
    is_active: {type: Boolean, required: true, default: true}
})
const UserProfile = mongoose.model("ha_user_profile",userProfile);

const userWifiInfo = new Schema({
    user_id:{type: mongoose.Types.ObjectId, required: true, ref: "UserProfile"},
    wifi_name : {type: String, required: true},
    wifi_password: {type: String, required: true},
    added_by: {type: mongoose.Types.ObjectId, required: true},
    modified_by: {type: mongoose.Types.ObjectId, required: true},
    added_date: {type: Date, required: true, default: ()=>new Date()},
    modified_date: {type: Date, required: true, default: ()=>new Date()},
    is_active: {type: Boolean, required: true, default: true}
})
const UserWifi = mongoose.model("ha_user_wifi_info",userWifiInfo);




module.exports = {
    UserProfile : UserProfile,
    UserWifi : UserWifi
}