"use strict"
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const httpContext = require("express-http-context");
const fileUpload = require("express-fileupload");


const userRoutes = require("./routes/user_routes");



const app = express();
app.use(bodyParser.json());
app.use(fileUpload());
app.use(httpContext.middleware);
const publicFolderPath = path.join(__dirname,"assests");
app.use(express.static(publicFolderPath));


// app.use(session({
//     secret: process.env.GOOGLE_API_KEY,
//     resave: false,
//     saveUninitialized: false
// }));
// app.use(passport.initialize());
// app.use(passport.session());

//Enable CORS for HTTP methods
app.use((req, resp, next) => {
    resp.header("Access-Control-Allow-Origin", "*",);
    resp.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    resp.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Authorization,Content-Type,Accept");
    next();
});



app.use("/api/user",userRoutes);



//here this is used when we want to confirm backend server is running or not via browser.
app.get("/", (req, resp) => {
    resp.status(200).send("Welcome to Home Automation Backend APIs");
});



const port = process.env.PORT || 2000;
var server = app.listen(port, () => {
    console.log(`Server Started : Listen on : ${port}`)
})
