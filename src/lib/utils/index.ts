import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isAfter, subDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function unreachable(message: string): never {
  throw new Error(`Unreachable: ${message}`);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const sevenDaysAgo = subDays(new Date(), 7);

  // For dates within the last 7 days, use "X days ago" format
  if (isAfter(dateObj, sevenDaysAgo)) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }

  // For older dates, use the format "MMM d, yyyy" (e.g., "Jan 1, 2024")
  return format(dateObj, "MMM d, yyyy");
}
