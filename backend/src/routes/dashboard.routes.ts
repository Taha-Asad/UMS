import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";

const router = Router();
const dashboardController = new DashboardController();

router.get("/student", authenticate, dashboardController.getStudentDashboard);
router.get(
  "/student/:studentId",
  authenticate,
  authorize("admin"),
  dashboardController.getStudentDashboard
);

router.get("/teacher", authenticate, dashboardController.getTeacherDashboard);
router.get(
  "/teacher/:teacherId",
  authenticate,
  authorize("admin"),
  dashboardController.getTeacherDashboard
);

router.get(
  "/admin",
  authenticate,
  authorize("admin"),
  dashboardController.getAdminDashboard
);

export default router;
