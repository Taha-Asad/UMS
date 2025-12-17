import { Router } from "express";
import { CourseOfferingController } from "../controllers/courseOffering.controller.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware.ts";

const router = Router();
const courseOfferingController = new CourseOfferingController();

router.get(
  "/semester/:semesterId",
  authenticate,
  courseOfferingController.getOfferingsBySemester
);
router.get(
  "/teacher/:teacherId",
  authenticate,
  courseOfferingController.getOfferingsByTeacher
);
router.get(
  "/available/:studentId/:semesterId",
  authenticate,
  courseOfferingController.getAvailableForStudent
);
router.get("/:id", authenticate, courseOfferingController.getOfferingById);
router.get(
  "/:id/capacity",
  authenticate,
  courseOfferingController.checkCapacity
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("course_id").isNumeric(),
    body("semester_id").isNumeric(),
    body("max_students").optional().isInt({ min: 1 }),
    validateRequest,
  ],
  courseOfferingController.createOffering
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "teacher"),
  courseOfferingController.updateOffering
);

export default router;
