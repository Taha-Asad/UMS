import { Router } from "express";
import { SemesterController } from "../controllers/semester.controller.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware.ts";

const router = Router();
const semesterController = new SemesterController();

router.get("/", authenticate, semesterController.getAllSemesters);
router.get("/current", authenticate, semesterController.getCurrentSemester);
router.get("/:id", authenticate, semesterController.getSemesterById);
router.get(
  "/:id/registration-status",
  authenticate,
  semesterController.checkRegistrationOpen
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("semester_name").notEmpty(),
    body("academic_year").matches(/^\d{4}-\d{4}$/),
    body("start_date").isISO8601(),
    body("end_date").isISO8601(),
    validateRequest,
  ],
  semesterController.createSemester
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  semesterController.updateSemester
);

router.put(
  "/:id/set-current",
  authenticate,
  authorize("admin"),
  semesterController.setCurrentSemester
);

export default router;
