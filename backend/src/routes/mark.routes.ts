import { Router } from "express";
import { MarkController } from "../controllers/mark.controller.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware.ts";

const router = Router();
const markController = new MarkController();

router.post(
  "/submit",
  authenticate,
  [
    body("assessmentId").isNumeric(),
    body("studentId").isNumeric(),
    validateRequest,
  ],
  markController.submitAssignment
);

router.put(
  "/:id/grade",
  authenticate,
  authorize("teacher", "admin"),
  [body("marks").isFloat({ min: 0 }), validateRequest],
  markController.gradeSubmission
);

router.post(
  "/bulk-grade",
  authenticate,
  authorize("teacher", "admin"),
  [body("assessmentId").isNumeric(), body("grades").isArray(), validateRequest],
  markController.bulkGrade
);

router.get(
  "/assessment/:assessmentId",
  authenticate,
  markController.getMarksByAssessment
);
router.get(
  "/student/:studentId",
  authenticate,
  markController.getMarksByStudent
);
router.get("/ungraded/:teacherId", authenticate, markController.getUngraded);
router.get(
  "/final-grade/:studentId/:offeringId",
  authenticate,
  markController.calculateFinalGrade
);
router.get(
  "/performance/:assessmentId",
  authenticate,
  markController.getClassPerformance
);

export default router;
