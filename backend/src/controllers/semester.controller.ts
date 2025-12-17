import type { Request, Response } from "express";
import { SemesterModel } from "../modals/semester.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class SemesterController {
  // Create semester
  createSemester = asyncHandler(async (req: Request, res: Response) => {
    const semesterData = req.body;
    const semesterId = await SemesterModel.create(semesterData);
    const semester = await SemesterModel.findById(semesterId);

    ApiResponse.success(
      res,
      {
        message: "Semester created successfully",
        semester,
      },
      201
    );
  });

  // Get all semesters
  getAllSemesters = asyncHandler(async (req: Request, res: Response) => {
    const semesters = await SemesterModel.getAll();
    ApiResponse.success(res, semesters);
  });

  // Get semester by ID
  getSemesterById = asyncHandler(async (req: Request, res: Response) => {
    const semesterId = parseInt(req.params.id);
    const semester = await SemesterModel.findById(semesterId);

    if (!semester) {
      return ApiResponse.error(res, "Semester not found", 404);
    }

    ApiResponse.success(res, semester);
  });

  // Get current semester
  getCurrentSemester = asyncHandler(async (req: Request, res: Response) => {
    const semester = await SemesterModel.getCurrentSemester();

    if (!semester) {
      return ApiResponse.error(res, "No current semester set", 404);
    }

    ApiResponse.success(res, semester);
  });

  // Set current semester
  setCurrentSemester = asyncHandler(async (req: Request, res: Response) => {
    const semesterId = parseInt(req.params.id);
    const success = await SemesterModel.setCurrentSemester(semesterId);

    if (!success) {
      return ApiResponse.error(res, "Failed to set current semester", 400);
    }

    ApiResponse.success(res, {
      message: "Current semester updated successfully",
    });
  });

  // Update semester
  updateSemester = asyncHandler(async (req: Request, res: Response) => {
    const semesterId = parseInt(req.params.id);
    const updates = req.body;

    const success = await SemesterModel.update(semesterId, updates);
    if (!success) {
      return ApiResponse.error(res, "Failed to update semester", 400);
    }

    ApiResponse.success(res, { message: "Semester updated successfully" });
  });

  // Check registration status
  checkRegistrationOpen = asyncHandler(async (req: Request, res: Response) => {
    const semesterId = parseInt(req.params.id);
    const isOpen = await SemesterModel.isRegistrationOpen(semesterId);

    ApiResponse.success(res, {
      semesterId,
      registrationOpen: isOpen,
    });
  });
}
