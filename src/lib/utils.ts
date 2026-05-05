import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return formatDate(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/** SUS Scoring Algorithm */
export function calculateSUSScore(responses: number[]): number {
  if (responses.length !== 10) return 0;
  const score = responses.reduce((acc, val, idx) => {
    // Odd indices (0,2,4,6,8) = positive questions: score - 1
    // Even indices (1,3,5,7,9) = negative questions: 5 - score
    if (idx % 2 === 0) return acc + (val - 1);
    return acc + (5 - val);
  }, 0);
  return score * 2.5;
}

export function getSUSCategory(score: number): {
  label: string;
  color: string;
  grade: string;
} {
  if (score >= 90)
    return { label: "Terbaik (Best Imaginable)", color: "#22c55e", grade: "A+" };
  if (score >= 80)
    return { label: "Sangat Baik (Excellent)", color: "#16a34a", grade: "A" };
  if (score >= 70)
    return { label: "Baik (Good)", color: "#3b82f6", grade: "B" };
  if (score >= 60)
    return { label: "Cukup (OK)", color: "#f59e0b", grade: "C" };
  if (score >= 50)
    return { label: "Jelek (Poor)", color: "#f97316", grade: "D" };
  return { label: "Terburuk (Worst Imaginable)", color: "#ef4444", grade: "F" };
}

export function numberToWords(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)} Jt`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)} Rb`;
  return num.toString();
}
