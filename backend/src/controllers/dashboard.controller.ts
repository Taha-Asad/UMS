import type { Request, Response } from "express";
import { DashboardModel } from "../modals/dashboard.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class DashboardController {
  // Get student dashboard
  getStudentDashboard = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.userId || parseInt(req.params.studentId);
    const dashboard = await DashboardModel.getStudentDashboard(studentId);
    ApiResponse.success(res, dashboard);
  });

  // Get teacher dashboard
  getTeacherDashboard = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user?.userId || parseInt(req.params.teacherId);
    const dashboard = await DashboardModel.getTeacherDashboard(teacherId);
    ApiResponse.success(res, dashboard);
  });

  // Get admin dashboard
  getAdminDashboard = asyncHandler(async (req: Request, res: Response) => {
    const dashboard = await DashboardModel.getAdminDashboard();
    ApiResponse.success(res, dashboard);
  });
}
