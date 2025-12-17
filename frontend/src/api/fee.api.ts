import { api } from "./axios";
import type { ApiResponse } from "../types";

export interface Fee {
  fee_id: number;
  student_id: number;
  semester_id: number;
  fee_type:
    | "tuition"
    | "hostel"
    | "library"
    | "laboratory"
    | "sports"
    | "exam"
    | "other";
  amount: number;
  due_date: string;
  paid_amount: number;
  status: "pending" | "partial" | "paid" | "overdue";
  late_fee?: number;
  created_at: string;
  paid_at?: string;
}

export interface FinancialSummary {
  total_fees: number;
  paid_fees: number;
  pending_fees: number;
  overdue_fees: number;
  late_fees: number;
}

export const feeApi = {
  create: (
    data: Omit<
      Fee,
      "fee_id" | "paid_amount" | "status" | "created_at" | "paid_at"
    >
  ) => api.post<ApiResponse<Fee>>("/fees", data),

  getByStudent: (studentId: number, status?: string) =>
    api.get<ApiResponse<Fee[]>>(`/fees/student/${studentId}`, {
      params: { status },
    }),

  getFinancialSummary: (studentId: number) =>
    api.get<ApiResponse<FinancialSummary>>(
      `/fees/student/${studentId}/summary`
    ),

  getBySemester: (semesterId: number) =>
    api.get<ApiResponse<Fee[]>>(`/fees/semester/${semesterId}`),

  getById: (feeId: number) => api.get<ApiResponse<Fee>>(`/fees/${feeId}`),

  makePayment: (
    feeId: number,
    amount: number,
    paymentMethod: string,
    transactionId?: string
  ) =>
    api.post<ApiResponse<{ message: string }>>(`/fees/pay/${feeId}`, {
      amount,
      paymentMethod,
      transactionId,
    }),

  generateBulkFees: (
    semesterId: number,
    feeType: string,
    amount: number,
    dueDate: string
  ) =>
    api.post<ApiResponse<{ message: string }>>("/fees/generate-bulk", {
      semesterId,
      feeType,
      amount,
      dueDate,
    }),

  updateLateFees: () =>
    api.post<ApiResponse<{ message: string }>>("/fees/update-late-fees"),

  update: (feeId: number, updates: Partial<Fee>) =>
    api.put<ApiResponse<Fee>>(`/fees/${feeId}`, updates),

  delete: (feeId: number) =>
    api.delete<ApiResponse<{ message: string }>>(`/fees/${feeId}`),
};
