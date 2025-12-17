import type { Request, Response } from "express";
import { TimetableModel } from "../modals/timetable.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class TimetableController {
  // Create schedule
  createSchedule = asyncHandler(async (req: Request, res: Response) => {
    const scheduleData = req.body;

    // Check room availability
    const isAvailable = await TimetableModel.checkRoomAvailability(
      scheduleData.room_number,
      scheduleData.day_of_week,
      scheduleData.start_time,
      scheduleData.end_time
    );

    if (!isAvailable) {
      return ApiResponse.error(res, "Room is not available at this time", 400);
    }

    const scheduleId = await TimetableModel.create(scheduleData);
    const schedule = await TimetableModel.findById(scheduleId);

    ApiResponse.success(
      res,
      {
        message: "Schedule created successfully",
        schedule,
      },
      201
    );
  });

  // Get schedule by offering
  getScheduleByOffering = asyncHandler(async (req: Request, res: Response) => {
    const offeringId = parseInt(req.params.offeringId);
    const schedules = await TimetableModel.getByOffering(offeringId);
    ApiResponse.success(res, schedules);
  });

  // Get room schedule
  getRoomSchedule = asyncHandler(async (req: Request, res: Response) => {
    const { roomNumber } = req.params;
    const { semesterId } = req.query;

    const schedules = await TimetableModel.getByRoom(
      roomNumber,
      semesterId ? parseInt(semesterId as string) : undefined
    );

    ApiResponse.success(res, schedules);
  });

  // Get student timetable
  getStudentTimetable = asyncHandler(async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    const { semesterId } = req.query;

    const timetable = await TimetableModel.getStudentTimetable(
      studentId,
      semesterId ? parseInt(semesterId as string) : undefined
    );

    ApiResponse.success(res, timetable);
  });

  // Get teacher timetable
  getTeacherTimetable = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = parseInt(req.params.teacherId);
    const { semesterId } = req.query;

    const timetable = await TimetableModel.getTeacherTimetable(
      teacherId,
      semesterId ? parseInt(semesterId as string) : undefined
    );

    ApiResponse.success(res, timetable);
  });

  // Update schedule
  updateSchedule = asyncHandler(async (req: Request, res: Response) => {
    const scheduleId = parseInt(req.params.id);
    const updates = req.body;

    // Check room availability if room or time is being changed
    if (
      updates.room_number ||
      updates.day_of_week ||
      updates.start_time ||
      updates.end_time
    ) {
      const current = await TimetableModel.findById(scheduleId);
      if (!current) {
        return ApiResponse.error(res, "Schedule not found", 404);
      }

      const isAvailable = await TimetableModel.checkRoomAvailability(
        updates.room_number || current.room_number,
        updates.day_of_week || current.day_of_week,
        updates.start_time || current.start_time,
        updates.end_time || current.end_time,
        scheduleId
      );

      if (!isAvailable) {
        return ApiResponse.error(
          res,
          "Room is not available at this time",
          400
        );
      }
    }

    const success = await TimetableModel.update(scheduleId, updates);
    if (!success) {
      return ApiResponse.error(res, "Failed to update schedule", 400);
    }

    ApiResponse.success(res, { message: "Schedule updated successfully" });
  });

  // Delete schedule
  deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
    const scheduleId = parseInt(req.params.id);
    const success = await TimetableModel.delete(scheduleId);

    if (!success) {
      return ApiResponse.error(res, "Failed to delete schedule", 400);
    }

    ApiResponse.success(res, { message: "Schedule deleted successfully" });
  });
}
