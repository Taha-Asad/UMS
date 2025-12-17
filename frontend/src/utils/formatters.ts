import { format, formatDistance, parseISO, isValid } from "date-fns";

export const formatDate = (
  date: string | Date,
  pattern = "MMM dd, yyyy"
): string => {
  if (!date) return "-";
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return isValid(parsedDate) ? format(parsedDate, pattern) : "-";
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, "MMM dd, yyyy HH:mm");
};

export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return "-";
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return isValid(parsedDate)
    ? formatDistance(parsedDate, new Date(), { addSuffix: true })
    : "-";
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatGrade = (marks: number): string => {
  if (marks >= 90) return "A+";
  if (marks >= 80) return "A";
  if (marks >= 70) return "B+";
  if (marks >= 60) return "B";
  if (marks >= 50) return "C";
  if (marks >= 40) return "D";
  return "F";
};

export const getInitials = (name: string): string => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
};

// utils/format.ts
export const formatNumber = (
  value: string | number | null | undefined,
  decimals: number = 2
): string => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  const num = Number(value);

  if (isNaN(num)) {
    return "N/A";
  }

  return num.toFixed(decimals);
};

export const formatCurrency = (
  value: string | number | null | undefined,
  currency: string = "PKR"
): string => {
  if (value === null || value === undefined || value === "") {
    return `${currency} 0`;
  }

  const num = Number(value);

  if (isNaN(num)) {
    return `${currency} 0`;
  }

  return `${currency} ${num.toLocaleString()}`;
};
