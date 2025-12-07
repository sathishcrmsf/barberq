import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates and normalizes phone number in +91 format
 * Format: +91XXXXXXXXXX (exactly 13 characters: +91 + 10 digits)
 * @param phone - Phone number to validate
 * @returns Normalized phone number or null if invalid
 */
export function validateAndNormalizePhone(phone: string): string | null {
  // Remove all spaces and non-digit characters except +
  const cleaned = phone.replace(/\s+/g, "").trim();
  
  // Check if it starts with +91
  if (cleaned.startsWith("+91")) {
    // Validate format: +91 followed by exactly 10 digits
    const phoneRegex = /^\+91\d{10}$/;
    if (phoneRegex.test(cleaned)) {
      return cleaned;
    }
  }
  
  // If it's just 10 digits, add +91 prefix
  const digitsOnly = cleaned.replace(/\D/g, "");
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  
  return null;
}

/**
 * Validates phone number format without normalization
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidPhoneFormat(phone: string): boolean {
  const normalized = validateAndNormalizePhone(phone);
  return normalized !== null;
}

/**
 * Formats a number as Indian Rupee (INR) currency
 * @param amount - Amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string with ₹ symbol
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return `₹${amount.toFixed(decimals)}`;
}
