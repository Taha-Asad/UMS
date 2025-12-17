import { Router } from "express";
import authRoutes from "./auth.routes.ts";
import userRoutes from "./user.routes.ts";
import departmentRoutes from "./department.routes.ts";
import courseRoutes from "./course.routes.ts";
import semesterRoutes from "./semester.routes.ts";
import courseOfferingRoutes from "./courseOffering.routes.ts";
import enrollmentRoutes from "./enrollment.routes.ts";
import attendanceRoutes from "./attendance.routes.ts";
import timetableRoutes from "./timetable.routes.ts";
import assessmentRoutes from "./assessment.routes.ts";
import markRoutes from "./mark.routes.ts";
import feeRoutes from "./fee.routes.ts";
import libraryRoutes from "./library.routes.ts";
import noticeRoutes from "./notice.routes.ts";
import dashboardRoutes from "./dashboard.routes.ts";
import auditLogRoutes from "./auditLog.routes.ts";
import sessionRoutes from "./session.routes.ts";

const router = Router();

// Health check
router.get("/", (req, res) => {
  res.json({
    message: "University Management System API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      users: "/api/v1/users",
      departments: "/api/v1/departments",
      courses: "/api/v1/courses",
      semesters: "/api/v1/semesters",
      courseOfferings: "/api/v1/course-offerings",
      enrollments: "/api/v1/enrollments",
      attendance: "/api/v1/attendance",
      timetable: "/api/v1/timetable",
      assessments: "/api/v1/assessments",
      marks: "/api/v1/marks",
      fees: "/api/v1/fees",
      library: "/api/v1/library",
      notices: "/api/v1/notices",
      dashboard: "/api/v1/dashboard",
      auditLogs: "/api/v1/audit-logs",
      sessions: "/api/v1/sessions",
    },
  });
});

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/departments", departmentRoutes);
router.use("/courses", courseRoutes);
router.use("/semesters", semesterRoutes);
router.use("/course-offerings", courseOfferingRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/timetable", timetableRoutes);
router.use("/assessments", assessmentRoutes);
router.use("/marks", markRoutes);
router.use("/fees", feeRoutes);
router.use("/library", libraryRoutes);
router.use("/notices", noticeRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/audit-logs", auditLogRoutes);
router.use("/sessions", sessionRoutes);

export default router;
