import { Router } from "express";
import {createUser, resetPassword} from "../controllers/userControllers";
import { loginUser, logoutUser, getLocationHistory,verifyUserCreate,resendOtp,forgotPassword} from "../controllers/userControllers";
import { authUserMiddleware } from "../middlewares/userMiddlewares";
import { body } from 'express-validator';
import {verifyToken}  from "../controllers/userControllers";
const router = Router();

router.post("/register",
    [
    body("name").isLength({min:3}).withMessage('Name is required'),
    body("email").isEmail().withMessage('Invalid email format'),    
    body("password").isLength({min :6}).withMessage("Password must be at least 6 characters long"),
]

, createUser);
router.post("/login",[
    body("email").isEmail().withMessage('Invalid email format'),    
    body("password").isLength({min :6}).withMessage("Password must be at least 6 characters long"),
], loginUser);
router.post('/logout', authUserMiddleware, logoutUser);
router.get("/verify-token", authUserMiddleware, verifyToken);
router.post("/after-verify",verifyUserCreate);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/locationHistory" ,authUserMiddleware,getLocationHistory)

export default router;
