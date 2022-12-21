import express from "express";
import auth from '../middlewares/authentication.js'; 
const router = express.Router();

//load controllers
import homeController from "../controllers/home.js";
import authController from "../controllers/auth.js";
import usersController from "../controllers/users.js";
import devicesController from "../controllers/devices.js";

//auth
router.get("/login", authController.login)
router.post("/login", authController.loginAttempt)
router.get("/logout", authController.logoutAttempt)

//home
router.get("/", auth.webAuthenticate, homeController.index);
router.get("/users", auth.webAuthenticate, usersController.index);
router.get("/devices", auth.webAuthenticate, devicesController.index);

export default router;