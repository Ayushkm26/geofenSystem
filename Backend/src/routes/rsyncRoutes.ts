import { body } from "express-validator";
import { authUserMiddleware } from "../middlewares/userMiddlewares";
import { approveResyncRequest, createResyncRequest,getResyncRequests, getUserResyncHistory, rejectResyncRequest } from "../controllers/rsyncController";
import { Router } from "express";
import { authAdminMiddleware } from "../middlewares/adminMiddlewares";
const router = Router();
router.post(
  "/resync",
  [
    body("fenceId")
      .isUUID()
      .withMessage("Fence ID must be a valid UUID"),

    body("timing")
      .isISO8601()
      .withMessage("Timing must be a valid date")
      .toDate(),

    body("type")
      .isString()
      .isLength({ min: 3 })
      .withMessage("Type must be at least 3 characters long"),

    body("requestReason")
      .isString()
      .isLength({ min: 6 })
      .withMessage("Reason must be at least 6 characters long"),
  ],
  authUserMiddleware,
  createResyncRequest
);
export default router;
router.get("/rsync/admin", authAdminMiddleware, getResyncRequests);
router.put("/rsync/:id/approve", authAdminMiddleware, approveResyncRequest);
router.put("/rsync/:id/reject", authAdminMiddleware, rejectResyncRequest);
router.get("/rsync/user", authUserMiddleware, getUserResyncHistory);
