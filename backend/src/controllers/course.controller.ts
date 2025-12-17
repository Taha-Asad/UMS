import type { Request, Response } from "express";
import { CourseModel } from "../modals/course.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class CourseController {
  // Create course
  createCourse = asyncHandler(async (req: Request, res: Response) => {
    const courseData = req.body;

    const existingCourse = await CourseModel.findByCode(courseData.course_code);
    if (existingCourse) {
      return ApiResponse.error(res, "Course code already exists", 400);
    }

    const courseId = await CourseModel.create(courseData);
    const course = await CourseModel.findById(courseId);

    ApiResponse.success(
      res,
      {
        message: "Course created successfully",
        course,
      },
      201
    );
  });

  // Get all courses
  getAllCourses = asyncHandler(async (req: Request, res: Response) => {
    const { limit = "100", offset = "0" } = req.query;
    const courses = await CourseModel.getAll(Number(limit), Number(offset));
    ApiResponse.success(res, courses);
  });

  // Get course by ID
  getCourseById = asyncHandler(async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.id);
    const course = await CourseModel.findById(courseId);

    if (!course) {
      return ApiResponse.error(res, "Course not found", 404);
    }

    ApiResponse.success(res, course);
  });

  // Get courses by department
  getCoursesByDepartment = asyncHandler(async (req: Request, res: Response) => {
    const departmentId = parseInt(req.params.departmentId);
    const courses = await CourseModel.getByDepartment(departmentId);
    ApiResponse.success(res, courses);
  });

  // Get courses by semester
  getCoursesBySemester = asyncHandler(async (req: Request, res: Response) => {
    const semester = parseInt(req.params.semester);
    const { departmentId } = req.query;

    const courses = await CourseModel.getBySemester(
      semester,
      departmentId ? parseInt(departmentId as string) : undefined
    );

    ApiResponse.success(res, courses);
  });

  // Update course
  updateCourse = asyncHandler(async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.id);
    const updates = req.body;

    const success = await CourseModel.update(courseId, updates);
    if (!success) {
      return ApiResponse.error(res, "Failed to update course", 400);
    }

    ApiResponse.success(res, { message: "Course updated successfully" });
  });

  // Delete course
  deleteCourse = asyncHandler(async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.id);

    const success = await CourseModel.delete(courseId);
    if (!success) {
      return ApiResponse.error(res, "Failed to delete course", 400);
    }

    ApiResponse.success(res, { message: "Course deleted successfully" });
  });

  // Search courses
  searchCourses = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;

    if (!q) {
      return ApiResponse.error(res, "Search query is required", 400);
    }

    const courses = await CourseModel.search(q as string);
    ApiResponse.success(res, courses);
  });
}
