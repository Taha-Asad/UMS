import type { Response } from "express";

export class ApiResponse {
  static success(res: Response, data: any, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
    });
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    errors: any = null
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}
