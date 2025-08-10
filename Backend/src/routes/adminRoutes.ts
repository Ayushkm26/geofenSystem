import { Router } from "express";
import { createAdmin, loginAdmin,logoutAdmin,addGeofence,deleteGeofence,getGeofenceDetails ,updateGeofence,getGeofences} from "../controllers/adminControllers";
import { authAdminMiddleware } from "../middlewares/adminMiddlewares";
import { body } from 'express-validator';
const router = Router();
router.post("/register", [
    body("name").isLength({ min: 3 }).withMessage('Name is required'),
    body("email").isEmail().withMessage('Invalid email format'),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
],createAdmin);
router.post("/login",[
    body("email").isEmail().withMessage('Invalid email format'),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),   
], loginAdmin);
router.post("/logout", authAdminMiddleware, logoutAdmin);
router .post("/addGeofence", authAdminMiddleware, addGeofence);
router.delete("/deleteGeofence/:id", authAdminMiddleware, deleteGeofence);
router.get("/getGeofences", authAdminMiddleware, getGeofences);
router.get("/getGeofence/:id", authAdminMiddleware, getGeofenceDetails);
router.put("/updateGeofence/:id", authAdminMiddleware, updateGeofence);
export default router;