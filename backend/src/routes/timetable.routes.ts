import { Router } from "express";
import { TimetableController } from "../controllers/timetable.controller.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware.ts";

const router = Router();
const timetableController = new TimetableController();

router.get(
  "/offering/:offeringId",
  authenticate,
  timetableController.getScheduleByOffering
);
router.get(
  "/room/:roomNumber",
  authenticate,
  timetableController.getRoomSchedule
);
router.get(
  "/student/:studentId",
  authenticate,
  timetableController.getStudentTimetable
);
router.get(
  "/teacher/:teacherId",
  authenticate,
  timetableController.getTeacherTimetable
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("offering_id").isNumeric(),
    body("day_of_week").isIn([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]),
    body("start_time").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body("end_time").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body("room_number").notEmpty(),
    validateRequest,
  ],
  timetableController.createSchedule
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  timetableController.updateSchedule
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  timetableController.deleteSchedule
);

export default router;
