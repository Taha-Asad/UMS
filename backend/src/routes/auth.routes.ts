import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.ts";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware.ts";
import { authenticate } from "../middleware/auth.middleware.ts";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  [
    body("username").isLength({ min: 3 }).trim(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
    body("full_name").notEmpty(),
    body("role").isIn(["admin", "teacher", "student", "staff", "librarian"]),
    body("gender").isIn(["male", "female", "other"]),
    body("date_of_birth").isISO8601(),
    body("phone").matches(/^\d{10,15}$/),
    validateRequest,
  ],
  authController.register
);

router.post(
  "/login",
  [body("username").notEmpty(), body("password").notEmpty(), validateRequest],
  authController.login
);

router.post("/logout", authenticate, authController.logout);
router.post("/refresh", authController.refreshToken);

router.post(
  "/change-password",
  authenticate,
  [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 8 }),
    validateRequest,
  ],
  authController.changePassword
);

export default router;
