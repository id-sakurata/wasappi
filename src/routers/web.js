const express = require("express");
const auth = require('../middlewares/authentication.js'); 
const router = express.Router();

//load controllers
const homeController = require("../controllers/home.js");
const authController = require("../controllers/auth.js");
const usersController = require("../controllers/users.js");
const devicesController = require("../controllers/devices.js");

//auth
router.get("/login", authController.login)
router.post("/login", authController.loginAttempt)
router.get("/logout", authController.logoutAttempt)

//home
router.get("/", auth.webAuthenticate, homeController.index);
router.get("/users", auth.webAuthenticate, usersController.index);
router.get("/devices", auth.webAuthenticate, devicesController.index);

module.exports = router;