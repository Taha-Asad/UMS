export type InvoiceStatus =
  | "unpaid"
  | "paid"
  | "partial"
  | "overdue"
  | "cancelled";
export type PaymentMethod = "online" | "cash" | "bank" | "cheque" | "upi";

export interface FeeItem {
  item_id?: number;
  title: string;
  amount: number;
  description?: string;
}

export interface FeeInvoice {
  invoice_id: number;
  student_id: number;
  items: FeeItem[];
  amount: number;
  currency: string; // e.g. 'INR'
  due_date: string;
  status: InvoiceStatus;
  description?: string;
  created_at: string;
  paid_at?: string;
}

export interface CreateInvoiceInput {
  student_id: number;
  items: FeeItem[];
  due_date: string; // ISO date
  currency?: string;
  description?: string;
}

export interface Payment {
  payment_id: number;
  invoice_id: number;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  paid_at: string;
  status: "success" | "failed" | "pending";
}

export interface PayInvoiceInput {
  invoice_id: number;
  amount: number;
  method: PaymentMethod;
  reference?: string;
}

export interface FeeStats {
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  totalCollected: number;
  totalOutstanding: number;
}
