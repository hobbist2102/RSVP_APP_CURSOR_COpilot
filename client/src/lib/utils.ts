import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  
  try {
    if (typeof date === "string") {
      // If it's not a valid ISO string, just return it
      try {
        date = parseISO(date);
      } catch (e) {
        return date;
      }
    }
    
    return format(date, "MMMM d, yyyy");
  } catch (e) {
    return String(date);
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  
  try {
    if (typeof date === "string") {
      // If it's not a valid ISO string, just return it
      try {
        date = parseISO(date);
      } catch (e) {
        return date;
      }
    }
    
    return format(date, "MMMM d, yyyy h:mm a");
  } catch (e) {
    return String(date);
  }
}

export function getRsvpStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "text-green-700 bg-green-100 border-green-400";
    case "declined":
      return "text-red-700 bg-red-100 border-red-400";
    case "pending":
      return "text-yellow-700 bg-yellow-100 border-yellow-400";
    default:
      return "text-gray-700 bg-gray-100 border-gray-400";
  }
}

export function getInitials(name: string): string {
  if (!name) return "?";
  
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function capitalizeFirstLetter(string: string): string {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function calculateRsvpProgress(confirmed: number, declined: number, pending: number): number {
  const total = confirmed + declined + pending;
  if (total === 0) return 0;
  
  return Math.round(((confirmed + declined) / total) * 100);
}

export function getDaysDifference(date: Date | string | null | undefined): number {
  if (!date) return 0;
  
  try {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (e) {
    return 0;
  }
}
