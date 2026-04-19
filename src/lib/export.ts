import * as XLSX from "xlsx";
import { AttendanceStatus } from "@prisma/client";
import { attendanceStatusLabel, formatDate } from "./utils";

export interface AttendanceExportRow {
  courseName: string;
  sessionTitle: string;
  sessionDate: Date;
  studentName: string;
  nationalId: string;
  status: AttendanceStatus;
  note?: string | null;
}

export function exportToExcel(rows: AttendanceExportRow[], filename: string): Buffer {
  const data = [
    ["קורס", "מפגש", "תאריך", "שם תלמיד/ה", "תעודת זהות", "נוכחות", "הערה"],
    ...rows.map((r) => [
      r.courseName,
      r.sessionTitle,
      formatDate(r.sessionDate),
      r.studentName,
      r.nationalId,
      attendanceStatusLabel(r.status),
      r.note ?? "",
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "נוכחות");

  // Auto-size columns
  const colWidths = data[0].map((_, i) =>
    Math.max(...data.map((row) => String(row[i] ?? "").length), 10)
  );
  ws["!cols"] = colWidths.map((w) => ({ wch: w + 2 }));

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

export function exportToCSV(rows: AttendanceExportRow[]): string {
  const headers = ["קורס", "מפגש", "תאריך", "שם תלמיד/ה", "תעודת זהות", "נוכחות", "הערה"];
  const escape = (val: string) =>
    val.includes(",") || val.includes('"') || val.includes("\n")
      ? `"${val.replace(/"/g, '""')}"`
      : val;

  const lines = [
    headers.map(escape).join(","),
    ...rows.map((r) =>
      [
        r.courseName,
        r.sessionTitle,
        formatDate(r.sessionDate),
        r.studentName,
        r.nationalId,
        attendanceStatusLabel(r.status),
        r.note ?? "",
      ]
        .map(String)
        .map(escape)
        .join(",")
    ),
  ];

  return "\uFEFF" + lines.join("\n"); // BOM for Excel UTF-8 compatibility
}

// Stub: hook for future Google Sheets sync
// Call this after saving attendance to push data to a configured sheet.
// Implement by installing `googleapis` and using a service account.
export async function syncToGoogleSheets(
  _rows: AttendanceExportRow[]
): Promise<{ synced: boolean; message: string }> {
  // TODO: implement with googleapis when GOOGLE_SHEETS_SPREADSHEET_ID is set
  if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
    return { synced: false, message: "Google Sheets not configured" };
  }
  return { synced: false, message: "Not implemented yet" };
}
