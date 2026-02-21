import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

export function formatCurrency(value: number | null, currency = 'USD'): string {
  if (value == null) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID().split('-')[0];
}
