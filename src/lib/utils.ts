// This file provides utility functions for the application.

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function to merge Tailwind CSS classes.
 * It uses clsx to conditionally apply classes and twMerge to resolve conflicts.
 * @param inputs The class values to merge.
 * @returns A string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
