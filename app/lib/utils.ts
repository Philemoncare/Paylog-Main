import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * PRODUCTION-SAFE DATE FORMATTING
 * Prevents hydration mismatches by ensuring consistent string representation.
 */
export function formatDate(date: string | Date | null | undefined, options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }) {
  if (!date) return "---";
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return "---";

  // We use en-GB for consistent day/month/year ordering
  return new Intl.DateTimeFormat('en-GB', options).format(d);
}

export function formatFullDate(date: string | Date | null | undefined) {
  return formatDate(date, { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatCompactDate(date: string | Date | null | undefined) {
  return formatDate(date, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatTime(date: string | Date | null | undefined) {
  return formatDate(date, { hour: '2-digit', minute: '2-digit', hour12: true });
}
