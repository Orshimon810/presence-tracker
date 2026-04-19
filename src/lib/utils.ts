import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, fmt = "dd/MM/yyyy") {
  return format(new Date(date), fmt, { locale: he });
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: he });
}

export function attendanceStatusLabel(status: string) {
  const map: Record<string, string> = {
    PRESENT: "נוכח/ת",
    ABSENT: "נעדר/ת",
    LATE: "איחור",
  };
  return map[status] ?? status;
}

export function attendanceStatusColor(status: string) {
  const map: Record<string, string> = {
    PRESENT: "bg-green-100 text-green-800",
    ABSENT: "bg-red-100 text-red-800",
    LATE: "bg-yellow-100 text-yellow-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
}

export function roleLabel(role: string) {
  const map: Record<string, string> = {
    ADMIN: "מנהל",
    COORDINATOR: "רכז/ת",
    INSTRUCTOR: "מדריך/ה",
  };
  return map[role] ?? role;
}

export function calculateAttendanceRate(present: number, total: number) {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}

// Convert rows to CSV string
export function toCSV(headers: string[], rows: string[][]): string {
  const escape = (val: string) =>
    val.includes(",") || val.includes('"') || val.includes("\n")
      ? `"${val.replace(/"/g, '""')}"`
      : val;

  return [
    headers.map(escape).join(","),
    ...rows.map((r) => r.map(escape).join(",")),
  ].join("\n");
}
