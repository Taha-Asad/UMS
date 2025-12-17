import type { Request, Response } from "express";
import { UserModel } from "../modals/user.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class UserController {
  // Get all users
  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const { role, limit = "100", offset = "0" } = req.query;

    let users;
    if (role === "student") {
      users = await UserModel.getAllStudents(Number(limit), Number(offset));
    } else if (role === "teacher") {
      users = await UserModel.getAllTeachers(Number(limit), Number(offset));
    } else {
      // Get all users - implement a general method in UserModel if needed
      users = await UserModel.search("", role as string);
    }

    ApiResponse.success(res, users);
  });

  // Get user by ID
  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);

    const user = await UserModel.findById(userId);

    if (!user) {
      return ApiResponse.error(res, "User not found", 404);
    }

    // Remove sensitive information
    const { password_hash, ...userWithoutPassword } = user;

    ApiResponse.success(res, userWithoutPassword);
  });

  // Update user
  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.password_hash;
    delete updates.user_id;
    delete updates.created_at;

    const success = await UserModel.update(userId, updates);

    if (!success) {
      return ApiResponse.error(res, "Failed to update user", 400);
    }

    const updatedUser = await UserModel.findById(userId);
    ApiResponse.success(res, {
      message: "User updated successfully",
      user: updatedUser,
    });
  });

  // Delete user (soft delete)
  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);

    const success = await UserModel.delete(userId);

    if (!success) {
      return ApiResponse.error(res, "Failed to delete user", 400);
    }

    ApiResponse.success(res, { message: "User deleted successfully" });
  });

  // Get current user profile
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    const user = await UserModel.findById(userId!);

    if (!user) {
      return ApiResponse.error(res, "User not found", 404);
    }

    const { password_hash, ...userWithoutPassword } = user;

    ApiResponse.success(res, userWithoutPassword);
  });

  // Update profile
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const updates = req.body;

    // Only allow certain fields to be updated
    const allowedFields = [
      "phone",
      "address",
      "profile_photo",
      "guardian_name",
      "guardian_phone",
    ];
    const filteredUpdates: any = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    const success = await UserModel.update(userId!, filteredUpdates);

    if (!success) {
      return ApiResponse.error(res, "Failed to update profile", 400);
    }

    ApiResponse.success(res, { message: "Profile updated successfully" });
  });

  // Search users
  searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const { q, role } = req.query;

    if (!q) {
      return ApiResponse.error(res, "Search query is required", 400);
    }

    const users = await UserModel.search(q as string, role as string);

    ApiResponse.success(res, users);
  });

  // Get user statistics
  getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = {
      students: await UserModel.countByRole("student"),
      teachers: await UserModel.countByRole("teacher"),
      staff: await UserModel.countByRole("staff"),
      librarians: await UserModel.countByRole("librarian"),
      admins: await UserModel.countByRole("admin"),
    };

    ApiResponse.success(res, stats);
  });

  // Get all teachers
  getAllTeachers = asyncHandler(async (req: Request, res: Response) => {
    const { limit = "100", offset = "0" } = req.query;
    const teachers = await UserModel.getAllTeachers(
      Number(limit),
      Number(offset)
    );

    // Remove sensitive information
    const teachersWithoutPassword = teachers.map(({ password_hash, ...teacher }) => teacher);

    ApiResponse.success(res, teachersWithoutPassword);
  });

  // Get all students
  getAllStudents = asyncHandler(async (req: Request, res: Response) => {
    const { limit = "100", offset = "0" } = req.query;
    const students = await UserModel.getAllStudents(
      Number(limit),
      Number(offset)
    );

    // Remove sensitive information
    const studentsWithoutPassword = students.map(({ password_hash, ...student }) => student);

    ApiResponse.success(res, studentsWithoutPassword);
  });
}
