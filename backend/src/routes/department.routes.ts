import { Router } from "express";
import { DepartmentController } from "../controllers/department.controller.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware.ts";

const router = Router();
const departmentController = new DepartmentController();

router.get("/", authenticate, departmentController.getAllDepartments);
router.get("/:id", authenticate, departmentController.getDepartmentById);
router.get("/:id/stats", authenticate, departmentController.getDepartmentStats);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("dept_code").notEmpty().isLength({ max: 10 }),
    body("dept_name").notEmpty().isLength({ max: 100 }),
    validateRequest,
  ],
  departmentController.createDepartment
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  departmentController.updateDepartment
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  departmentController.deleteDepartment
);

export default router;
