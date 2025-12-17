import { Router } from "express";
import { AuditLogController } from "../controllers/auditLog.controller.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";

const router = Router();
const auditLogController = new AuditLogController();

router.get(
  "/user/:userId",
  authenticate,
  authorize("admin"),
  auditLogController.getLogsByUser
);
router.get(
  "/table/:tableName",
  authenticate,
  authorize("admin"),
  auditLogController.getLogsByTable
);
router.get(
  "/date-range",
  authenticate,
  authorize("admin"),
  auditLogController.getLogsByDateRange
);
router.get(
  "/recent",
  authenticate,
  authorize("admin"),
  auditLogController.getRecentActivity
);
router.get(
  "/stats",
  authenticate,
  authorize("admin"),
  auditLogController.getStatsByOperation
);

router.post(
  "/cleanup",
  authenticate,
  authorize("admin"),
  auditLogController.cleanupLogs
);

export default router;
