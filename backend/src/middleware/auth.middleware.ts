import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/apiResponse.ts";
import { UserSessionModel } from "../modals/userSession.ts";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        role: string;
        sessionId: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return ApiResponse.error(res, "Authentication required", 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as any;

    // Validate session
    const isValidSession = await UserSessionModel.validate(decoded.sessionId);

    if (!isValidSession) {
      return ApiResponse.error(res, "Session expired", 401);
    }

    req.user = decoded;
    next();
  } catch (error) {
    return ApiResponse.error(res, "Invalid token", 401);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.error(res, "Authentication required", 401);
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(res, "Insufficient permissions", 403);
    }

    next();
  };
};
