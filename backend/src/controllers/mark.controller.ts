import type { Request, Response } from "express";
import { MarkModel } from "../modals/marks.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class MarkController {
  // Submit assignment
  submitAssignment = asyncHandler(async (req: Request, res: Response) => {
    const { assessmentId, studentId, submissionData } = req.body;

    const markId = await MarkModel.submitAssignment(
      assessmentId,
      studentId,
      submissionData
    );

    ApiResponse.success(
      res,
      {
        message: "Assignment submitted successfully",
        markId,
      },
      201
    );
  });

  // Grade submission
  gradeSubmission = asyncHandler(async (req: Request, res: Response) => {
    const markId = parseInt(req.params.id);
    const { marks, feedback } = req.body;
    const gradedBy = req.user?.userId;

    const success = await MarkModel.gradeSubmission(
      markId,
      marks,
      gradedBy!,
      feedback
    );

    if (!success) {
      return ApiResponse.error(res, "Failed to grade submission", 400);
    }

    ApiResponse.success(res, { message: "Submission graded successfully" });
  });

  // Bulk grade
  bulkGrade = asyncHandler(async (req: Request, res: Response) => {
    const { assessmentId, grades } = req.body;
    const gradedBy = req.user?.userId;

    const affectedCount = await MarkModel.bulkGrade(
      assessmentId,
      grades,
      gradedBy!
    );

    ApiResponse.success(res, {
      message: `${affectedCount} submissions graded successfully`,
    });
  });

  // Get marks by assessment
  getMarksByAssessment = asyncHandler(async (req: Request, res: Response) => {
    const assessmentId = parseInt(req.params.assessmentId);
    const marks = await MarkModel.getByAssessment(assessmentId);
    ApiResponse.success(res, marks);
  });

  // Get marks by student
  getMarksByStudent = asyncHandler(async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    const { offeringId } = req.query;

    const marks = await MarkModel.getByStudent(
      studentId,
      offeringId ? parseInt(offeringId as string) : undefined
    );

    ApiResponse.success(res, marks);
  });

  // Get ungraded submissions
  getUngraded = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user?.userId || parseInt(req.params.teacherId);
    const submissions = await MarkModel.getUngraded(teacherId);
    ApiResponse.success(res, submissions);
  });

  // Calculate final grade
  calculateFinalGrade = asyncHandler(async (req: Request, res: Response) => {
    const { studentId, offeringId } = req.params;

    const finalGrade = await MarkModel.calculateFinalGrade(
      parseInt(studentId),
      parseInt(offeringId)
    );

    ApiResponse.success(res, {
      studentId,
      offeringId,
      finalGrade,
    });
  });

  // Get class performance
  getClassPerformance = asyncHandler(async (req: Request, res: Response) => {
    const assessmentId = parseInt(req.params.assessmentId);
    const performance = await MarkModel.getClassPerformance(assessmentId);
    ApiResponse.success(res, performance);
  });
}
