import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function generateResearchId(): string {
  const prefix = "P";
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}${num}`;
}
