import { Router } from "express";
import { addGeofenceHttp, createAdmin, loginAdmin,logoutAdmin,verifyAdminAfterCreate,resendAdminOtp, forgotAdminPassword, resetAdminPassword,getAllPlans} from "../controllers/adminControllers";
import { authAdminMiddleware,PaymentauthAdminMiddleware} from "../middlewares/adminMiddlewares";
import { body } from 'express-validator';
import { verify } from "crypto";
import { verifyTokenforAdmin } from "../controllers/adminControllers";
import { createOrder, verifyPayment } from "../controllers/PaymentController";
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
router.post("/addGeofence", authAdminMiddleware, addGeofenceHttp);
// router.delete("/deleteGeofence/:id", authAdminMiddleware, deleteGeofence);
// router.get("/getGeofences", authAdminMiddleware, getGeofences);
// router.get("/getGeofence/:id", authAdminMiddleware, getGeofenceDetails);
// router.put("/updateGeofence/:id", authAdminMiddleware, updateGeofence);
router.get("/verify-token", authAdminMiddleware, verifyTokenforAdmin); // normal dashboard
router.get("/verify-token-lite", PaymentauthAdminMiddleware, verifyTokenforAdmin);
router.get("/get-plans", PaymentauthAdminMiddleware, getAllPlans);
router.post("/after-verify", verifyAdminAfterCreate);
router.post("/resend-otp", resendAdminOtp);
router.post("/forgot-password", forgotAdminPassword);
router.post("/reset-password", resetAdminPassword);
router.post('/create-order/:planId', PaymentauthAdminMiddleware, createOrder);
router.post('/verify-payment', PaymentauthAdminMiddleware, verifyPayment);
export default router;