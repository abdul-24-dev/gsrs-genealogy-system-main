import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "Unknown";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Unknown";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Unknown";
  }
}

export function formatYear(date: string | Date | null | undefined): string {
  if (!date) return "";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.getFullYear().toString();
  } catch {
    return "";
  }
}

export function calculateAge(
  birthDate: string | Date | null | undefined,
  deathDate: string | Date | null | undefined,
  isDeceased: boolean
): string {
  if (!birthDate) return "Unknown";
  try {
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return "Unknown";

    const end = isDeceased && deathDate ? new Date(deathDate) : new Date();
    if (isNaN(end.getTime())) return "Unknown";

    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
      age--;
    }

    if (age < 0) return "Unknown";
    return isDeceased ? `${age} yrs (at death)` : `${age} yrs`;
  } catch {
    return "Unknown";
  }
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
