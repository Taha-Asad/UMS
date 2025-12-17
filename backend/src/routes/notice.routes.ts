import { Router } from "express";
import { NoticeController } from "../controllers/notice.controller.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware.ts";

const router = Router();
const noticeController = new NoticeController();

router.get("/", authenticate, noticeController.getActiveNotices);
router.get("/important", authenticate, noticeController.getImportantNotices);
router.get("/search", authenticate, noticeController.searchNotices);
router.get("/:id", authenticate, noticeController.getNoticeById);

router.post(
  "/",
  authenticate,
  authorize("admin", "teacher"),
  [
    body("title").notEmpty().isLength({ max: 200 }),
    body("content").notEmpty(),
    body("category")
      .optional()
      .isIn(["academic", "exam", "event", "holiday", "urgent", "general"]),
    body("target_audience")
      .optional()
      .isIn(["all", "students", "teachers", "staff", "department"]),
    validateRequest,
  ],
  noticeController.createNotice
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  noticeController.updateNotice
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  noticeController.deleteNotice
);

export default router;
