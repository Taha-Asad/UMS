import type { Request, Response } from "express";
import { NoticeModel } from "../modals/notice.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class NoticeController {
  // Create notice
  createNotice = asyncHandler(async (req: Request, res: Response) => {
    const noticeData = {
      ...req.body,
      posted_by: req.user?.userId,
    };

    const noticeId = await NoticeModel.create(noticeData);
    const notice = await NoticeModel.findById(noticeId);

    ApiResponse.success(
      res,
      {
        message: "Notice created successfully",
        notice,
      },
      201
    );
  });

  // Get active notices
  getActiveNotices = asyncHandler(async (req: Request, res: Response) => {
    const { userRole, departmentId } = req.query;

    const notices = await NoticeModel.getActive(
      userRole as string,
      departmentId ? parseInt(departmentId as string) : undefined
    );

    ApiResponse.success(res, notices);
  });

  // Get important notices
  getImportantNotices = asyncHandler(async (req: Request, res: Response) => {
    const notices = await NoticeModel.getImportant();
    ApiResponse.success(res, notices);
  });

  // Get notice by ID
  getNoticeById = asyncHandler(async (req: Request, res: Response) => {
    const noticeId = parseInt(req.params.id);
    const notice = await NoticeModel.findById(noticeId);

    if (!notice) {
      return ApiResponse.error(res, "Notice not found", 404);
    }

    ApiResponse.success(res, notice);
  });

  // Update notice
  updateNotice = asyncHandler(async (req: Request, res: Response) => {
    const noticeId = parseInt(req.params.id);
    const updates = req.body;

    const success = await NoticeModel.update(noticeId, updates);
    if (!success) {
      return ApiResponse.error(res, "Failed to update notice", 400);
    }

    ApiResponse.success(res, { message: "Notice updated successfully" });
  });

  // Delete notice
  deleteNotice = asyncHandler(async (req: Request, res: Response) => {
    const noticeId = parseInt(req.params.id);
    const success = await NoticeModel.delete(noticeId);

    if (!success) {
      return ApiResponse.error(res, "Failed to delete notice", 400);
    }

    ApiResponse.success(res, { message: "Notice deleted successfully" });
  });

  // Search notices
  searchNotices = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;

    if (!q) {
      return ApiResponse.error(res, "Search query is required", 400);
    }

    const notices = await NoticeModel.search(q as string);
    ApiResponse.success(res, notices);
  });
}
