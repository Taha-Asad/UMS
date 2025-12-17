import { Router } from "express";
import { AttendanceController } from "../controllers/attendance.controller.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware.ts";

const router = Router();
const attendanceController = new AttendanceController();

router.post(
  "/mark",
  authenticate,
  authorize("teacher", "admin"),
  [
    body("offeringId").isNumeric(),
    body("date").isISO8601(),
    body("attendanceData").isArray(),
    validateRequest,
  ],
  attendanceController.markAttendance
);

router.get(
  "/course/:offeringId",
  authenticate,
  attendanceController.getAttendanceByDate
);
router.get(
  "/course/:offeringId/stats",
  authenticate,
  attendanceController.getCourseAttendanceStats
);
router.get(
  "/student/:studentId/:offeringId",
  authenticate,
  attendanceController.getStudentAttendance
);
router.get("/report", authenticate, attendanceController.getAttendanceReport);

router.put(
  "/:id",
  authenticate,
  authorize("teacher", "admin"),
  attendanceController.updateAttendance
);

export default router;
