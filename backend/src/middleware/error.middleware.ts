import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/apiResponse.ts";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", error);

  if (error.code === "ER_DUP_ENTRY") {
    return ApiResponse.error(res, "Duplicate entry found", 400);
  }

  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return ApiResponse.error(res, "Referenced record not found", 400);
  }

  if (error.name === "ValidationError") {
    return ApiResponse.error(res, error.message, 400);
  }

  if (error.name === "JsonWebTokenError") {
    return ApiResponse.error(res, "Invalid token", 401);
  }

  if (error.name === "TokenExpiredError") {
    return ApiResponse.error(res, "Token expired", 401);
  }

  return ApiResponse.error(
    res,
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : error.message,
    500
  );
};
