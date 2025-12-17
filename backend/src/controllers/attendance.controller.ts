import type { Request, Response } from "express";
import { AttendanceModel } from "../modals/attendance.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class AttendanceController {
  // Mark attendance
  markAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { offeringId, date, attendanceData } = req.body;
    const markedBy = req.user?.userId;

    if (!Array.isArray(attendanceData)) {
      return ApiResponse.error(res, "Attendance data must be an array", 400);
    }

    try {
      await AttendanceModel.markAttendance(
        offeringId,
        date,
        markedBy!,
        attendanceData
      );

      ApiResponse.success(res, { message: "Attendance marked successfully" });
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400);
    }
  });

  // Get attendance by date
  getAttendanceByDate = asyncHandler(async (req: Request, res: Response) => {
    const offeringId = parseInt(req.params.offeringId);
    const { date } = req.query;

    if (!date) {
      return ApiResponse.error(res, "Date is required", 400);
    }

    const attendance = await AttendanceModel.getByDate(
      offeringId,
      date as string
    );

    ApiResponse.success(res, attendance);
  });

  // Get student attendance
  getStudentAttendance = asyncHandler(async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    const offeringId = parseInt(req.params.offeringId);

    const stats = await AttendanceModel.getStudentAttendance(
      studentId,
      offeringId
    );

    ApiResponse.success(res, stats);
  });

  // Get course attendance statistics
  getCourseAttendanceStats = asyncHandler(
    async (req: Request, res: Response) => {
      const offeringId = parseInt(req.params.offeringId);

      const stats = await AttendanceModel.getCourseAttendanceStats(offeringId);

      ApiResponse.success(res, stats);
    }
  );

  // Update attendance
  updateAttendance = asyncHandler(async (req: Request, res: Response) => {
    const attendanceId = parseInt(req.params.id);
    const updates = req.body;

    const success = await AttendanceModel.update(attendanceId, updates);

    if (!success) {
      return ApiResponse.error(res, "Failed to update attendance", 400);
    }

    ApiResponse.success(res, { message: "Attendance updated successfully" });
  });

  // Get attendance report
  getAttendanceReport = asyncHandler(async (req: Request, res: Response) => {
    const { offeringId, startDate, endDate } = req.query;

    if (!offeringId) {
      return ApiResponse.error(res, "Offering ID is required", 400);
    }

    // This would need more complex implementation in the model
    const stats = await AttendanceModel.getCourseAttendanceStats(
      parseInt(offeringId as string)
    );

    ApiResponse.success(res, stats);
  });
}
