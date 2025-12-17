import type { Request, Response } from "express";
import { UserSessionModel } from "../modals/userSession.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class SessionController {
  // Get active sessions
  getActiveSessions = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.query;

    const sessions = await UserSessionModel.getActiveSessions(
      userId ? parseInt(userId as string) : undefined
    );

    ApiResponse.success(res, sessions);
  });

  // Get user session history
  getUserSessionHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const { limit = "50" } = req.query;

    const sessions = await UserSessionModel.getUserSessionHistory(
      userId,
      Number(limit)
    );
    ApiResponse.success(res, sessions);
  });

  // Invalidate session
  invalidateSession = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const success = await UserSessionModel.invalidate(sessionId);

    if (!success) {
      return ApiResponse.error(res, "Failed to invalidate session", 400);
    }

    ApiResponse.success(res, { message: "Session invalidated successfully" });
  });

  // Invalidate all user sessions
  invalidateUserSessions = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const count = await UserSessionModel.invalidateUserSessions(userId);

    ApiResponse.success(res, {
      message: `${count} sessions invalidated`,
    });
  });

  // Get session statistics
  getSessionStatistics = asyncHandler(async (req: Request, res: Response) => {
    const stats = await UserSessionModel.getSessionStatistics();
    ApiResponse.success(res, stats);
  });

  // Get security events
  getSecurityEvents = asyncHandler(async (req: Request, res: Response) => {
    const { userId, limit = "100" } = req.query;

    const events = await UserSessionModel.getSecurityEvents(
      userId ? parseInt(userId as string) : undefined,
      Number(limit)
    );

    ApiResponse.success(res, events);
  });

  // Detect suspicious activity
  detectSuspiciousActivity = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = parseInt(req.params.userId);
      const activity = await UserSessionModel.detectSuspiciousActivity(userId);
      ApiResponse.success(res, activity);
    }
  );

  // Cleanup expired sessions
  cleanupSessions = asyncHandler(async (req: Request, res: Response) => {
    const count = await UserSessionModel.cleanupExpiredSessions();

    ApiResponse.success(res, {
      message: `${count} expired sessions cleaned up`,
    });
  });
}
