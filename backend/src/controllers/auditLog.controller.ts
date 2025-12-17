import type { Request, Response } from "express";
import { AuditLogModel } from "../modals/auditLog.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class AuditLogController {
  // Get logs by user
  getLogsByUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const { limit = "100" } = req.query;

    const logs = await AuditLogModel.getByUser(userId, Number(limit));
    ApiResponse.success(res, logs);
  });

  // Get logs by table
  getLogsByTable = asyncHandler(async (req: Request, res: Response) => {
    const { tableName } = req.params;
    const { recordId, limit = "100" } = req.query;

    const logs = await AuditLogModel.getByTable(
      tableName,
      recordId ? parseInt(recordId as string) : undefined,
      Number(limit)
    );

    ApiResponse.success(res, logs);
  });

  // Get logs by date range
  getLogsByDateRange = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, limit = "500" } = req.query;

    if (!startDate || !endDate) {
      return ApiResponse.error(
        res,
        "Start date and end date are required",
        400
      );
    }

    const logs = await AuditLogModel.getByDateRange(
      startDate as string,
      endDate as string,
      Number(limit)
    );

    ApiResponse.success(res, logs);
  });

  // Get recent activity
  getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
    const { limit = "50" } = req.query;
    const logs = await AuditLogModel.getRecentActivity(Number(limit));
    ApiResponse.success(res, logs);
  });

  // Get statistics by operation
  getStatsByOperation = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    const stats = await AuditLogModel.getStatsByOperation(
      startDate as string,
      endDate as string
    );

    ApiResponse.success(res, stats);
  });

  // Cleanup old logs
  cleanupLogs = asyncHandler(async (req: Request, res: Response) => {
    const { daysToKeep = "90" } = req.body;
    const deletedCount = await AuditLogModel.cleanup(Number(daysToKeep));

    ApiResponse.success(res, {
      message: `${deletedCount} old logs deleted`,
    });
  });
}
