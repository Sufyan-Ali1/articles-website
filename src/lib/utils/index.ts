import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export { safeHttpUrl } from "@/lib/security/urls";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatDate(value: string | null) {
  if (!value || Number.isNaN(Date.parse(value))) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
