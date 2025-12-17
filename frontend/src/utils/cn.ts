import { twMerge } from "tailwind-merge";

type ClassValue = string | number | boolean | null | undefined;

export function cn(...inputs: ClassValue[]) {
  const classes = inputs
    .filter((value) => typeof value === "string" || typeof value === "number")
    .join(" ");

  return twMerge(classes);
}
