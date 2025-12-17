import type { Request, Response } from "express";
import { FeeModel } from "../modals/fee.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class FeeController {
  // Create fee
  createFee = asyncHandler(async (req: Request, res: Response) => {
    const feeData = req.body;
    const feeId = await FeeModel.create(feeData);
    const fee = await FeeModel.findById(feeId);

    ApiResponse.success(
      res,
      {
        message: "Fee created successfully",
        fee,
      },
      201
    );
  });

  // Get fees by student
  getFeesByStudent = asyncHandler(async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    const { status } = req.query;

    const fees = await FeeModel.getByStudent(studentId, status as string);

    ApiResponse.success(res, fees);
  });

  // Make payment
  makePayment = asyncHandler(async (req: Request, res: Response) => {
    const feeId = parseInt(req.params.id);
    const { amount, paymentMethod, transactionId } = req.body;

    const success = await FeeModel.makePayment(
      feeId,
      amount,
      paymentMethod,
      transactionId
    );

    if (!success) {
      return ApiResponse.error(res, "Payment failed", 400);
    }

    ApiResponse.success(res, { message: "Payment successful" });
  });

  // Get financial summary
  getFinancialSummary = asyncHandler(async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    const summary = await FeeModel.getFinancialSummary(studentId);
    ApiResponse.success(res, summary);
  });

  // Get fees by semester
  getFeesBySemester = asyncHandler(async (req: Request, res: Response) => {
    const semesterId = parseInt(req.params.semesterId);
    const fees = await FeeModel.getBySemester(semesterId);
    ApiResponse.success(res, fees);
  });

  // Generate bulk fees
  generateBulkFees = asyncHandler(async (req: Request, res: Response) => {
    const { semesterId, feeType, amount, dueDate } = req.body;

    const affectedRows = await FeeModel.generateBulkFees(
      semesterId,
      feeType,
      amount,
      dueDate
    );

    ApiResponse.success(res, {
      message: `Fees generated for ${affectedRows} students`,
    });
  });

  // Update late fees
  updateLateFees = asyncHandler(async (req: Request, res: Response) => {
    const affectedRows = await FeeModel.updateLateFees();

    ApiResponse.success(res, {
      message: `Late fees updated for ${affectedRows} records`,
    });
  });

  // Get fee by ID
  getFeeById = asyncHandler(async (req: Request, res: Response) => {
    const feeId = parseInt(req.params.id);
    const fee = await FeeModel.findById(feeId);

    if (!fee) {
      return ApiResponse.error(res, "Fee record not found", 404);
    }

    ApiResponse.success(res, fee);
  });

  // Update fee
  updateFee = asyncHandler(async (req: Request, res: Response) => {
    const feeId = parseInt(req.params.id);
    const updates = req.body;

    const success = await FeeModel.update(feeId, updates);
    if (!success) {
      return ApiResponse.error(res, "Failed to update fee", 400);
    }

    const updatedFee = await FeeModel.findById(feeId);
    ApiResponse.success(res, {
      message: "Fee updated successfully",
      fee: updatedFee,
    });
  });

  // Delete fee
  deleteFee = asyncHandler(async (req: Request, res: Response) => {
    const feeId = parseInt(req.params.id);
    const success = await FeeModel.delete(feeId);

    if (!success) {
      return ApiResponse.error(
        res,
        "Failed to delete fee. Only unpaid or partial fees can be deleted.",
        400
      );
    }

    ApiResponse.success(res, { message: "Fee deleted successfully" });
  });
}
