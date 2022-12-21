import express from "express";
import auth from '../middlewares/authentication.js'; 
const router = express.Router();

//load controllers
import authController from "../controllers/api/auth.js";
import userController from "../controllers/api/user.js";
import devicesController from "../controllers/api/devices.js";

//auth
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

//user
router.post("/user/:id/update", userController.update);
router.post("/user/:id/delete", userController.del);
router.post("/user/datatables", userController.datatables);

//devices
router.post("/devices/create", auth.webAuthenticate, devicesController.create);
router.post("/devices/:id/delete", auth.webAuthenticate, devicesController.del);
router.post("/devices/:id/update", auth.webAuthenticate, devicesController.update);
router.post("/devices/datatables", auth.webAuthenticate, devicesController.datatables);
router.post("/devices/:id/run", auth.webAuthenticate, devicesController.run);
router.post("/devices/:id/restart", auth.webAuthenticate, devicesController.restart);
router.post("/devices/:id/stop", auth.webAuthenticate, devicesController.stop);
router.post("/devices/:id/status", auth.webAuthenticate, devicesController.status);

export default router;