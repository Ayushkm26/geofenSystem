import { Router } from "express";
import {createUser} from "../controllers/userControllers";
import { loginUser, logoutUser,logLocation ,GeofenceDetails, getLocationHistory} from "../controllers/userControllers";
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
router.get('/logout', authUserMiddleware, logoutUser);
router.get("/verify-token", authUserMiddleware, verifyToken);
router.post("/logLocation",authUserMiddleware,logLocation)
router.get("/geofenceDetails", authUserMiddleware, GeofenceDetails);
router.get("/locationHistory" ,authUserMiddleware,getLocationHistory)

export default router;
