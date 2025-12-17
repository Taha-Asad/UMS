import { useEffect, useState } from "react";
import { Box, Button, Chip } from "@mui/material";
import { feeApi } from "../../api";
import { PageHeader } from "../../components/layout";
import {
  Table,
  EmptyState,
  Spinner,
  Card,
  StatCard,
} from "../../components/common";
import { useAuthStore } from "../../store";
import {
  AccountBalanceWallet,
  CheckCircle,
  Warning,
  Payment,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { format } from "date-fns";
import type { Fee, FinancialSummary } from "../../api/fee.api";
import { formatCurrency } from "../../utils/formatters";
import { AxiosError } from "axios";

export const Fees = () => {
  const { user } = useAuthStore();
  const [fees, setFees] = useState<Fee[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const [feesRes, summaryRes] = await Promise.all([
          feeApi.getByStudent(user.user_id),
          feeApi.getFinancialSummary(user.user_id),
        ]);

        setFees(feesRes.data.data || []);
        setSummary(summaryRes.data.data);
      } catch (error) {
        console.error("Failed to load fees:", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user]);

  const handlePayment = async (feeId: number, amount: number) => {
    try {
      await feeApi.makePayment(feeId, amount, "online");
      toast.success("Payment recorded successfully");
      if (user) {
        const [feesRes, summaryRes] = await Promise.all([
          feeApi.getByStudent(user.user_id),
          feeApi.getFinancialSummary(user.user_id),
        ]);
        setFees(feesRes.data.data || []);
        setSummary(summaryRes.data.data);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Payment failed");
      } else {
        toast.error("Payment failed");
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Spinner />
      </Box>
    );
  }

  const getStatusColor = (status: Fee["status"]) => {
    switch (status) {
      case "paid":
        return "success";
      case "partial":
        return "warning";
      case "overdue":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <PageHeader
        title="Fees & payments"
        description="Track your fee challans, payments and pending balances."
      />

      {summary && (
        <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <StatCard
            label="Total fees"
            value={formatCurrency(summary.total_fees)}
            icon={<AccountBalanceWallet />}
          />
          <StatCard
            label="Paid"
            value={formatCurrency(summary.paid_fees)}
            icon={<CheckCircle />}
          />
          <StatCard
            label="Pending"
            value={formatCurrency(summary.pending_fees)}
            icon={<Warning />}
          />
          {summary.overdue_fees > 0 && (
            <StatCard
              label="Overdue"
              value={formatCurrency(summary.overdue_fees)}
              icon={<Payment />}
            />
          )}
        </Box>
      )}

      <Card
        title="Fee Records"
        description="All your fee challans and payment history."
      >
        {fees.length === 0 ? (
          <EmptyState
            title="No fee records"
            description="Your fee challans will appear here once they are generated."
          />
        ) : (
          <Table
            data={fees as unknown as Record<string, unknown>[]}
            columns={[
              {
                key: "fee_type",
                header: "Type",
                render: (row) => (
                  <Chip
                    label={row.fee_type as string}
                    size="small"
                    color="primary"
                  />
                ),
              },
              {
                key: "amount",
                header: "Amount",
                render: (row) => formatCurrency(row.amount as number),
              },
              {
                key: "paid_amount",
                header: "Paid",
                render: (row) => formatCurrency(row.paid_amount as number),
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <Chip
                    label={row.status as string}
                    size="small"
                    color={getStatusColor(row.status as Fee["status"])}
                  />
                ),
              },
              {
                key: "due_date",
                header: "Due Date",
                render: (row) =>
                  format(new Date(row.due_date as string), "MMM dd, yyyy"),
              },
              {
                key: "actions",
                header: "Actions",
                render: (row) => {
                  const remaining =
                    (row.amount as number) - (row.paid_amount as number);
                  if (remaining <= 0) return null;
                  return (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() =>
                        handlePayment(row.fee_id as number, remaining)
                      }
                    >
                      Pay {formatCurrency(remaining)}
                    </Button>
                  );
                },
              },
            ]}
          />
        )}
      </Card>
    </Box>
  );
};
