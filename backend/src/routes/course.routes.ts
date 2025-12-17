import { Router } from "express";
import { CourseController } from "../controllers/course.controller.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware.ts";

const router = Router();
const courseController = new CourseController();

router.get("/", authenticate, courseController.getAllCourses);
router.get("/search", authenticate, courseController.searchCourses);
router.get(
  "/department/:departmentId",
  authenticate,
  courseController.getCoursesByDepartment
);
router.get(
  "/semester/:semester",
  authenticate,
  courseController.getCoursesBySemester
);
router.get("/:id", authenticate, courseController.getCourseById);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("course_code").notEmpty(),
    body("course_name").notEmpty(),
    body("department_id").isNumeric(),
    body("credits").isInt({ min: 1, max: 6 }),
    body("semester").isInt({ min: 1, max: 8 }),
    validateRequest,
  ],
  courseController.createCourse
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  courseController.updateCourse
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  courseController.deleteCourse
);

export default router;
