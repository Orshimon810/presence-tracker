import * as XLSX from "xlsx";
import Papa from "papaparse";
import { importStudentRowSchema } from "./validations";

export interface ParsedStudent {
  fullName: string;
  nationalId: string;
  birthDate?: string;
}

export interface ImportResult {
  rows: ParsedStudent[];
  errors: Array<{ row: number; message: string }>;
}

function normalizeRow(raw: Record<string, unknown>): Record<string, string> {
  // Normalize Hebrew and English header names
  const normalized: Record<string, string> = {};
  for (const [key, val] of Object.entries(raw)) {
    const k = String(key).trim().toLowerCase();
    const v = String(val ?? "").trim();
    if (k.includes("שם") || k === "fullname" || k === "full_name" || k === "name") {
      normalized.fullName = v;
    } else if (
      k.includes("זהות") ||
      k === "nationalid" ||
      k === "national_id" ||
      k === "id" ||
      k === "tz"
    ) {
      normalized.nationalId = v;
    } else if (k.includes("לידה") || k.includes("birth") || k === "birthdate") {
      normalized.birthDate = v;
    }
  }
  return normalized;
}

export function parseCSV(content: string): ImportResult {
  const result = Papa.parse<Record<string, unknown>>(content, {
    header: true,
    skipEmptyLines: true,
  });

  const rows: ParsedStudent[] = [];
  const errors: Array<{ row: number; message: string }> = [];

  result.data.forEach((raw, idx) => {
    const normalized = normalizeRow(raw);
    const parsed = importStudentRowSchema.safeParse(normalized);
    if (parsed.success) {
      rows.push(parsed.data as ParsedStudent);
    } else {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      errors.push({ row: idx + 2, message: messages });
    }
  });

  return { rows, errors };
}

export function parseExcel(buffer: ArrayBuffer): ImportResult {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

  const rows: ParsedStudent[] = [];
  const errors: Array<{ row: number; message: string }> = [];

  raw.forEach((rawRow, idx) => {
    const normalized = normalizeRow(rawRow);
    const parsed = importStudentRowSchema.safeParse(normalized);
    if (parsed.success) {
      rows.push(parsed.data as ParsedStudent);
    } else {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      errors.push({ row: idx + 2, message: messages });
    }
  });

  return { rows, errors };
}
