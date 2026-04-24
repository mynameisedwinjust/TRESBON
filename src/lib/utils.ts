import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  // Format as RWF with proper spacing
  const formatted = new Intl.NumberFormat('en-RW', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
  return `${formatted} RWF`
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'

  const d = new Date(date)
  if (isNaN(d.getTime())) return 'N/A'

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function generateOrderNumber(): string {
  // Return a numeric-only placeholder
  return "000"
}

