import type { Request, Response } from "express";
import { DepartmentModel } from "../modals/department.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class DepartmentController {
  // Create department
  createDepartment = asyncHandler(async (req: Request, res: Response) => {
    const departmentData = req.body;

    const existingDept = await DepartmentModel.findByCode(
      departmentData.dept_code
    );
    if (existingDept) {
      return ApiResponse.error(res, "Department code already exists", 400);
    }

    const deptId = await DepartmentModel.create(departmentData);
    const department = await DepartmentModel.findById(deptId);

    ApiResponse.success(
      res,
      {
        message: "Department created successfully",
        department,
      },
      201
    );
  });

  // Get all departments
  getAllDepartments = asyncHandler(async (req: Request, res: Response) => {
    const { includeInactive } = req.query;
    const departments = await DepartmentModel.getAll(
      includeInactive === "true"
    );
    ApiResponse.success(res, departments);
  });

  // Get department by ID
  getDepartmentById = asyncHandler(async (req: Request, res: Response) => {
    const deptId = parseInt(req.params.id);
    const department = await DepartmentModel.findById(deptId);

    if (!department) {
      return ApiResponse.error(res, "Department not found", 404);
    }

    ApiResponse.success(res, department);
  });

  // Update department
  updateDepartment = asyncHandler(async (req: Request, res: Response) => {
    const deptId = parseInt(req.params.id);
    const updates = req.body;

    const success = await DepartmentModel.update(deptId, updates);
    if (!success) {
      return ApiResponse.error(res, "Failed to update department", 400);
    }

    ApiResponse.success(res, { message: "Department updated successfully" });
  });

  // Delete department
  deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
    const deptId = parseInt(req.params.id);

    const success = await DepartmentModel.delete(deptId);
    if (!success) {
      return ApiResponse.error(res, "Failed to delete department", 400);
    }

    ApiResponse.success(res, { message: "Department deleted successfully" });
  });

  // Get department statistics
  getDepartmentStats = asyncHandler(async (req: Request, res: Response) => {
    const deptId = parseInt(req.params.id);
    const department = await DepartmentModel.findById(deptId);

    if (!department) {
      return ApiResponse.error(res, "Department not found", 404);
    }

    const courseCount = await DepartmentModel.getCourseCount(deptId);
    const studentCount = await DepartmentModel.getStudentCount(
      department.dept_name
    );
    const teacherCount = await DepartmentModel.getTeacherCount(
      department.dept_name
    );

    ApiResponse.success(res, {
      department,
      statistics: {
        totalCourses: courseCount,
        totalStudents: studentCount,
        totalTeachers: teacherCount,
      },
    });
  });
}
