import { Router } from "express";
import { SessionController } from "../controllers/session.controller.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";

const router = Router();
const sessionController = new SessionController();

router.get(
  "/active",
  authenticate,
  authorize("admin"),
  sessionController.getActiveSessions
);
router.get(
  "/user/:userId/history",
  authenticate,
  authorize("admin"),
  sessionController.getUserSessionHistory
);
router.get(
  "/statistics",
  authenticate,
  authorize("admin"),
  sessionController.getSessionStatistics
);
router.get(
  "/security-events",
  authenticate,
  authorize("admin"),
  sessionController.getSecurityEvents
);
router.get(
  "/suspicious/:userId",
  authenticate,
  authorize("admin"),
  sessionController.detectSuspiciousActivity
);

router.post(
  "/invalidate/:sessionId",
  authenticate,
  authorize("admin"),
  sessionController.invalidateSession
);
router.post(
  "/invalidate-user/:userId",
  authenticate,
  authorize("admin"),
  sessionController.invalidateUserSessions
);
router.post(
  "/cleanup",
  authenticate,
  authorize("admin"),
  sessionController.cleanupSessions
);

export default router;
