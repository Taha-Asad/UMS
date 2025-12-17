import { Router } from "express";
import { AssessmentController } from "../controllers/assessment.controller.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware.ts";

const router = Router();
const assessmentController = new AssessmentController();

router.get(
  "/offering/:offeringId",
  authenticate,
  assessmentController.getAssessmentsByOffering
);
router.get(
  "/student/:studentId/upcoming",
  authenticate,
  assessmentController.getUpcomingAssessments
);
router.get(
  "/teacher/:teacherId",
  authenticate,
  assessmentController.getAssessmentsByTeacher
);
router.get(
  "/:id/statistics",
  authenticate,
  assessmentController.getAssessmentStatistics
);

router.post(
  "/",
  authenticate,
  authorize("teacher", "admin"),
  [
    body("offering_id").isNumeric(),
    body("title").notEmpty(),
    body("type").isIn([
      "assignment",
      "quiz",
      "midterm",
      "final",
      "project",
      "presentation",
    ]),
    body("total_marks").isFloat({ min: 0 }),
    body("due_date").isISO8601(),
    validateRequest,
  ],
  assessmentController.createAssessment
);

router.put(
  "/:id",
  authenticate,
  authorize("teacher", "admin"),
  assessmentController.updateAssessment
);

router.put(
  "/:id/publish",
  authenticate,
  authorize("teacher", "admin"),
  assessmentController.publishAssessment
);

router.delete(
  "/:id",
  authenticate,
  authorize("teacher", "admin"),
  assessmentController.deleteAssessment
);

export default router;
