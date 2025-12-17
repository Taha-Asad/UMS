import type { Request, Response } from "express";
import { EnrollmentModel } from "../modals/enrollment.ts";
import { CourseOfferingModel } from "../modals/courseOffering.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class EnrollmentController {
  // Enroll student in course
  enrollStudent = asyncHandler(async (req: Request, res: Response) => {
    const { studentId, offeringId } = req.body;

    try {
      const enrollmentId = await EnrollmentModel.create(studentId, offeringId);

      if (!enrollmentId) {
        return ApiResponse.error(res, "Enrollment failed", 400);
      }

      const enrollment = await EnrollmentModel.findById(enrollmentId);

      ApiResponse.success(
        res,
        {
          message: "Enrollment successful",
          enrollment,
        },
        201
      );
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400);
    }
  });

  // Get student enrollments
  getStudentEnrollments = asyncHandler(async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    const { status } = req.query;

    const enrollments = await EnrollmentModel.getByStudent(
      studentId,
      status as string
    );

    ApiResponse.success(res, enrollments);
  });

  // Get course enrollments
  getCourseEnrollments = asyncHandler(async (req: Request, res: Response) => {
    const offeringId = parseInt(req.params.offeringId);

    const enrollments = await EnrollmentModel.getByCourse(offeringId);

    ApiResponse.success(res, enrollments);
  });

  // Drop course
  dropCourse = asyncHandler(async (req: Request, res: Response) => {
    const enrollmentId = parseInt(req.params.id);

    const success = await EnrollmentModel.dropCourse(enrollmentId);

    if (!success) {
      return ApiResponse.error(res, "Failed to drop course", 400);
    }

    ApiResponse.success(res, { message: "Course dropped successfully" });
  });

  // Update grade
  updateGrade = asyncHandler(async (req: Request, res: Response) => {
    const enrollmentId = parseInt(req.params.id);
    const { marks } = req.body;

    if (marks < 0 || marks > 100) {
      return ApiResponse.error(
        res,
        "Invalid marks. Must be between 0 and 100",
        400
      );
    }

    const success = await EnrollmentModel.updateGrade(enrollmentId, marks);

    if (!success) {
      return ApiResponse.error(res, "Failed to update grade", 400);
    }

    ApiResponse.success(res, { message: "Grade updated successfully" });
  });

  // Calculate CGPA
  calculateCGPA = asyncHandler(async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);

    const cgpa = await EnrollmentModel.calculateCGPA(studentId);

    ApiResponse.success(res, { cgpa });
  });

  // Get available courses for student
  getAvailableCourses = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.userId || parseInt(req.params.studentId);
    const { semesterId } = req.query;

    if (!semesterId) {
      return ApiResponse.error(res, "Semester ID is required", 400);
    }

    const courses = await CourseOfferingModel.getAvailableForStudent(
      studentId!,
      parseInt(semesterId as string)
    );

    ApiResponse.success(res, courses);
  });

  // Get enrollment statistics
  getEnrollmentStats = asyncHandler(async (req: Request, res: Response) => {
    const { semesterId } = req.query;

    // This would need to be implemented in the model
    // For now, returning a placeholder
    ApiResponse.success(res, {
      totalEnrollments: 0,
      averageEnrollmentPerCourse: 0,
      mostPopularCourse: null,
      leastPopularCourse: null,
    });
  });
}
