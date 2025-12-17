import { Router } from "express";
import { EnrollmentController } from "../controllers/enrollment.controller.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware.ts";

const router = Router();
const enrollmentController = new EnrollmentController();

router.post(
  "/",
  authenticate,
  [
    body("studentId").isNumeric(),
    body("offeringId").isNumeric(),
    validateRequest,
  ],
  enrollmentController.enrollStudent
);

router.get(
  "/student/:studentId",
  authenticate,
  enrollmentController.getStudentEnrollments
);
router.get(
  "/course/:offeringId",
  authenticate,
  enrollmentController.getCourseEnrollments
);
router.get(
  "/available/:studentId",
  authenticate,
  enrollmentController.getAvailableCourses
);
router.get(
  "/stats",
  authenticate,
  authorize("admin"),
  enrollmentController.getEnrollmentStats
);

router.put("/:id/drop", authenticate, enrollmentController.dropCourse);
router.put(
  "/:id/grade",
  authenticate,
  authorize("teacher", "admin"),
  [body("marks").isFloat({ min: 0, max: 100 }), validateRequest],
  enrollmentController.updateGrade
);

router.get(
  "/cgpa/:studentId",
  authenticate,
  enrollmentController.calculateCGPA
);

export default router;
