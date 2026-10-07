import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const CURRENCY_SYMBOLS: Record<string, string> = { BDT: "৳", USD: "$", EUR: "€", GBP: "£", INR: "₹" };
export function currencySymbol(code: any): string {
  if (!code) return "৳";
  return CURRENCY_SYMBOLS[String(code).toUpperCase()] ?? String(code) + " ";
}
