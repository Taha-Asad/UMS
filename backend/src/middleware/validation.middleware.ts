import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiResponse } from "../utils/apiResponse.ts";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return ApiResponse.error(res, "Validation failed", 400, errors.array());
  }

  next();
};
