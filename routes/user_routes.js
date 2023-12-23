"use strict"
const express = require("express");
const routes = express();


const userController = require("../controllers/user_controller");

routes.post("/insert-registeration",userController.userRegisteration);
routes.post("/user-login",userController.userLogin);
routes.post("/verify-otp",userController.verifyUserOTP);
routes.post("/add-device-model",userController.verifyUserToken,userController.addDeviceModel);
routes.post("/insert-device-ip",userController.verifyUserToken,userController.insertDeviceIP);
routes.get("/fetch-all-device",userController.verifyUserToken,userController.fetchAllDeviceInfo);
// routes.get("")
// routes.post("/email-forget-password",userController.forgetPassword);
// routes.post("/update-password",userController.updatePassword);

// routes.post("/")



module.exports = routes;



