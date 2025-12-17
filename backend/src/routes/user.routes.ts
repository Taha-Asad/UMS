import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware.ts";
import { UserController } from "../controllers/user.controller.ts";

const router = Router();
const userController = new UserController();

// Get all users (admin only)
router.get("/", authenticate, authorize("admin"), userController.getAllUsers);

// Get user statistics (admin only)
router.get(
  "/stats",
  authenticate,
  authorize("admin"),
  userController.getUserStats
);

// Get current user profile
router.get("/profile", authenticate, userController.getProfile);

// Update current user profile
router.put("/profile", authenticate, userController.updateProfile);

// Search users
router.get("/search", authenticate, userController.searchUsers);

// Get all teachers (must be before /:id route)
router.get("/teachers", authenticate, userController.getAllTeachers);

// Get all students (must be before /:id route)
router.get("/students", authenticate, userController.getAllStudents);

// Get user by ID
router.get("/:id", authenticate, userController.getUserById);

// Update user (admin only)
router.put("/:id", authenticate, authorize("admin"), userController.updateUser);

// Delete user (admin only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  userController.deleteUser
);

export default router;
