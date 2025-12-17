import type { Request, Response } from "express";
import { CourseOfferingModel } from "../modals/courseOffering.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class CourseOfferingController {
  // Create course offering
  createOffering = asyncHandler(async (req: Request, res: Response) => {
    const offeringData = req.body;
    const offeringId = await CourseOfferingModel.create(offeringData);
    const offering = await CourseOfferingModel.findById(offeringId);

    ApiResponse.success(
      res,
      {
        message: "Course offering created successfully",
        offering,
      },
      201
    );
  });

  // Get offerings by semester
  getOfferingsBySemester = asyncHandler(async (req: Request, res: Response) => {
    const semesterId = parseInt(req.params.semesterId);
    const offerings = await CourseOfferingModel.getBySemester(semesterId);
    ApiResponse.success(res, offerings);
  });

  // Get offerings by teacher
  getOfferingsByTeacher = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = parseInt(req.params.teacherId);
    const { semesterId } = req.query;

    const offerings = await CourseOfferingModel.getByTeacher(
      teacherId,
      semesterId ? parseInt(semesterId as string) : undefined
    );

    ApiResponse.success(res, offerings);
  });

  // Get offering by ID
  getOfferingById = asyncHandler(async (req: Request, res: Response) => {
    const offeringId = parseInt(req.params.id);
    const offering = await CourseOfferingModel.findById(offeringId);

    if (!offering) {
      return ApiResponse.error(res, "Course offering not found", 404);
    }

    ApiResponse.success(res, offering);
  });

  // Update offering
  updateOffering = asyncHandler(async (req: Request, res: Response) => {
    const offeringId = parseInt(req.params.id);
    const updates = req.body;

    const success = await CourseOfferingModel.update(offeringId, updates);
    if (!success) {
      return ApiResponse.error(res, "Failed to update offering", 400);
    }

    ApiResponse.success(res, { message: "Offering updated successfully" });
  });

  // Check capacity
  checkCapacity = asyncHandler(async (req: Request, res: Response) => {
    const offeringId = parseInt(req.params.id);
    const hasCapacity = await CourseOfferingModel.hasCapacity(offeringId);

    ApiResponse.success(res, {
      offeringId,
      hasCapacity,
    });
  });

  // Get available courses for student
  getAvailableForStudent = asyncHandler(async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    const semesterId = parseInt(req.params.semesterId);

    const offerings = await CourseOfferingModel.getAvailableForStudent(
      studentId,
      semesterId
    );
    ApiResponse.success(res, offerings);
  });
}
