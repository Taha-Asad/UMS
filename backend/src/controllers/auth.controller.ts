import type { Request, Response } from "express";
import { UserModel } from "../modals/user.ts";
import { UserSessionModel } from "../modals/userSession.ts";
import { AuditLogModel } from "../modals/auditLog.ts";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class AuthController {
  // User Registration
  register = asyncHandler(async (req: Request, res: Response) => {
    const {
      username,
      password,
      email,
      full_name,
      role,
      gender,
      date_of_birth,
      phone,
      address,
      roll_number,
      employee_id,
      department,
    } = req.body;

    // Check if user exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return ApiResponse.error(res, "Email already registered", 400);
    }

    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
      return ApiResponse.error(res, "Username already taken", 400);
    }

    // Create user
    const userId = await UserModel.create({
      username,
      password_hash: password, // Will be hashed in model
      email,
      full_name,
      role,
      gender,
      date_of_birth,
      phone,
      address,
      roll_number,
      employee_id,
      department,
    });

    // Log the registration
    await AuditLogModel.log({
      table_name: "users",
      operation: "INSERT",
      user_id: userId,
      record_id: userId,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

    const user = await UserModel.findById(userId);

    ApiResponse.success(
      res,
      {
        message: "Registration successful",
        user: {
          user_id: user?.user_id,
          username: user?.username,
          email: user?.email,
          role: user?.role,
        },
      },
      201
    );
  });

  // User Login
  login = asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;

    // Find user
    const user = await UserModel.findByUsername(username);
    if (!user) {
      return ApiResponse.error(res, "Invalid credentials", 401);
    }

    // Check if account is locked
    if (
      user.account_locked_until &&
      new Date(user.account_locked_until) > new Date()
    ) {
      return ApiResponse.error(
        res,
        "Account is locked. Please try again later",
        423
      );
    }

    // Validate password
    const isValidPassword = await UserModel.validatePassword(
      password,
      user.password_hash
    );

    if (!isValidPassword) {
      await UserModel.handleFailedLogin(user.user_id);
      return ApiResponse.error(res, "Invalid credentials", 401);
    }

    // Check if active
    if (!user.is_active) {
      return ApiResponse.error(res, "Account is deactivated", 403);
    }

    // Reset failed attempts and update last login
    await UserModel.resetFailedAttempts(user.user_id);

    // Create session
    const sessionId = await UserSessionModel.create(
      user.user_id,
      req.ip || "",
      req.headers["user-agent"]
    );

    // Generate JWT
    const accessToken = jwt.sign(
      {
        userId: user.user_id,
        username: user.username,
        role: user.role,
        sessionId,
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id, sessionId },
      process.env.JWT_REFRESH_SECRET || "refresh-secret",
      { expiresIn: "7d" }
    );

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    ApiResponse.success(res, {
      message: "Login successful",
      accessToken,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        department: user.department,
      },
    });
  });

  // Logout
  logout = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.user?.sessionId;

    if (sessionId) {
      await UserSessionModel.invalidate(sessionId);
    }

    res.clearCookie("refreshToken");

    ApiResponse.success(res, { message: "Logout successful" });
  });

  // Refresh Token
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return ApiResponse.error(res, "Refresh token not provided", 401);
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || "refresh-secret"
      ) as any;

      const session = await UserSessionModel.findById(decoded.sessionId);

      if (!session || !session.is_active) {
        return ApiResponse.error(res, "Invalid session", 401);
      }

      const user = await UserModel.findById(decoded.userId);

      if (!user || !user.is_active) {
        return ApiResponse.error(res, "User not found or inactive", 401);
      }

      // Generate new access token
      const accessToken = jwt.sign(
        {
          userId: user.user_id,
          username: user.username,
          role: user.role,
          sessionId: decoded.sessionId,
        },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "24h" }
      );

      ApiResponse.success(res, { accessToken });
    } catch (error) {
      return ApiResponse.error(res, "Invalid refresh token", 401);
    }
  });

  // Change Password
  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await UserModel.findById(userId!);

    if (!user) {
      return ApiResponse.error(res, "User not found", 404);
    }

    const isValid = await UserModel.validatePassword(
      currentPassword,
      user.password_hash
    );

    if (!isValid) {
      return ApiResponse.error(res, "Current password is incorrect", 401);
    }

    const hashedPassword = await UserModel.hashPassword(newPassword);
    await UserModel.update(userId!, { password_hash: hashedPassword });

    // Invalidate all sessions
    await UserSessionModel.invalidateUserSessions(userId!);

    ApiResponse.success(res, { message: "Password changed successfully" });
  });
}
