import type { Request, Response } from "express";
import { AssessmentModel } from "../modals/assessment.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class AssessmentController {
  // Create assessment
  createAssessment = asyncHandler(async (req: Request, res: Response) => {
    const assessmentData = req.body;
    const assessmentId = await AssessmentModel.create(assessmentData);
    const assessment = await AssessmentModel.findById(assessmentId);

    ApiResponse.success(
      res,
      {
        message: "Assessment created successfully",
        assessment,
      },
      201
    );
  });

  // Get assessments by offering
  getAssessmentsByOffering = asyncHandler(
    async (req: Request, res: Response) => {
      const offeringId = parseInt(req.params.offeringId);
      const { publishedOnly } = req.query;

      const assessments = await AssessmentModel.getByOffering(
        offeringId,
        publishedOnly === "true"
      );

      ApiResponse.success(res, assessments);
    }
  );

  // Get upcoming assessments for student
  getUpcomingAssessments = asyncHandler(async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    const { days = "7" } = req.query;

    const assessments = await AssessmentModel.getUpcoming(
      studentId,
      parseInt(days as string)
    );

    ApiResponse.success(res, assessments);
  });

  // Get assessments by teacher
  getAssessmentsByTeacher = asyncHandler(
    async (req: Request, res: Response) => {
      const teacherId = parseInt(req.params.teacherId);
      const { semesterId } = req.query;

      const assessments = await AssessmentModel.getByTeacher(
        teacherId,
        semesterId ? parseInt(semesterId as string) : undefined
      );

      ApiResponse.success(res, assessments);
    }
  );

  // Publish assessment
  publishAssessment = asyncHandler(async (req: Request, res: Response) => {
    const assessmentId = parseInt(req.params.id);
    const success = await AssessmentModel.publish(assessmentId);

    if (!success) {
      return ApiResponse.error(res, "Failed to publish assessment", 400);
    }

    ApiResponse.success(res, { message: "Assessment published successfully" });
  });

  // Update assessment
  updateAssessment = asyncHandler(async (req: Request, res: Response) => {
    const assessmentId = parseInt(req.params.id);
    const updates = req.body;

    const success = await AssessmentModel.update(assessmentId, updates);
    if (!success) {
      return ApiResponse.error(res, "Failed to update assessment", 400);
    }

    ApiResponse.success(res, { message: "Assessment updated successfully" });
  });

  // Delete assessment
  deleteAssessment = asyncHandler(async (req: Request, res: Response) => {
    const assessmentId = parseInt(req.params.id);
    const success = await AssessmentModel.delete(assessmentId);

    if (!success) {
      return ApiResponse.error(res, "Failed to delete assessment", 400);
    }

    ApiResponse.success(res, { message: "Assessment deleted successfully" });
  });

  // Get assessment statistics
  getAssessmentStatistics = asyncHandler(
    async (req: Request, res: Response) => {
      const assessmentId = parseInt(req.params.id);
      const statistics = await AssessmentModel.getStatistics(assessmentId);
      ApiResponse.success(res, statistics);
    }
  );
}
