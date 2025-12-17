import { Router } from "express";
import { FeeController } from "../controllers/fee.controller.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware.ts";

const router = Router();
const feeController = new FeeController();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("student_id").isNumeric(),
    body("semester_id").isNumeric(),
    body("fee_type").isIn([
      "tuition",
      "hostel",
      "library",
      "laboratory",
      "sports",
      "exam",
      "other",
    ]),
    body("amount").isFloat({ min: 0 }),
    body("due_date").isISO8601(),
    validateRequest,
  ],
  feeController.createFee
);

router.get("/student/:studentId", authenticate, feeController.getFeesByStudent);
router.get(
  "/student/:studentId/summary",
  authenticate,
  feeController.getFinancialSummary
);
router.get(
  "/semester/:semesterId",
  authenticate,
  authorize("admin"),
  feeController.getFeesBySemester
);
router.get("/:id", authenticate, feeController.getFeeById);

router.post(
  "/pay/:id",
  authenticate,
  [
    body("amount").isFloat({ min: 0 }),
    body("paymentMethod").isIn(["cash", "bank", "online", "cheque"]),
    validateRequest,
  ],
  feeController.makePayment
);

router.post(
  "/generate-bulk",
  authenticate,
  authorize("admin"),
  [
    body("semesterId").isNumeric(),
    body("feeType").notEmpty(),
    body("amount").isFloat({ min: 0 }),
    body("dueDate").isISO8601(),
    validateRequest,
  ],
  feeController.generateBulkFees
);

router.post(
  "/update-late-fees",
  authenticate,
  authorize("admin"),
  feeController.updateLateFees
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  feeController.updateFee
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  feeController.deleteFee
);

export default router;
