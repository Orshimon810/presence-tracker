"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { importStudents, type ImportSummary } from "@/actions/students";
import { parseCSV, parseExcel, type ParsedStudent } from "@/lib/import";
import { Badge } from "@/components/ui/Badge";

interface ImportStudentsProps {
  courseId?: string;
}

export function ImportStudents({ courseId }: ImportStudentsProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [parsedRows, setParsedRows] = useState<ParsedStudent[] | null>(null);
  const [parseErrors, setParseErrors] = useState<Array<{ row: number; message: string }>>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setSummary(null);

    const isCSV = file.name.endsWith(".csv");
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (!isCSV && !isExcel) {
      setParseErrors([{ row: 0, message: "קובץ לא נתמך. יש להעלות CSV או Excel" }]);
      setParsedRows(null);
      return;
    }

    const buffer = await file.arrayBuffer();
    const result = isCSV
      ? parseCSV(new TextDecoder("utf-8").decode(buffer))
      : parseExcel(buffer);

    setParsedRows(result.rows);
    setParseErrors(result.errors);
  }

  function handleImport() {
    if (!parsedRows || parsedRows.length === 0) return;
    startTransition(async () => {
      const result = await importStudents(parsedRows, courseId);
      setSummary(result);
      setParsedRows(null);
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  function reset() {
    setParsedRows(null);
    setParseErrors([]);
    setSummary(null);
    setFileName(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {fileName ? (
          <p className="font-medium text-gray-700">{fileName}</p>
        ) : (
          <>
            <p className="font-medium text-gray-700">גרור קובץ או לחץ להעלאה</p>
            <p className="text-sm text-gray-400 mt-1">CSV, XLS, XLSX</p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Template info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
        <strong>פורמט נדרש:</strong> שם מלא, תעודת זהות, תאריך לידה (אופציונלי)
        <br />
        הכותרות בעברית: <code className="bg-blue-100 px-1 rounded">שם מלא</code>, <code className="bg-blue-100 px-1 rounded">תעודת זהות</code>, <code className="bg-blue-100 px-1 rounded">תאריך לידה</code>
        <br />
        גם כותרות באנגלית: <code className="bg-blue-100 px-1 rounded">fullName</code>, <code className="bg-blue-100 px-1 rounded">nationalId</code>, <code className="bg-blue-100 px-1 rounded">birthDate</code>
      </div>

      {/* Parse errors */}
      {parseErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="font-medium text-red-700 mb-2">שגיאות בקובץ:</p>
          <ul className="text-sm text-red-600 space-y-1">
            {parseErrors.map((err, i) => (
              <li key={i}>שורה {err.row}: {err.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview */}
      {parsedRows && parsedRows.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium text-gray-900">תצוגה מקדימה ({parsedRows.length} שורות)</p>
            <Button size="sm" variant="ghost" onClick={reset}>נקה</Button>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">#</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">שם מלא</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">תעודת זהות</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">תאריך לידה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parsedRows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2">{row.fullName}</td>
                    <td className="px-4 py-2 font-mono">{row.nationalId}</td>
                    <td className="px-4 py-2 text-gray-500">{row.birthDate ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={reset} disabled={isPending}>ביטול</Button>
            <Button onClick={handleImport} loading={isPending}>
              ייבא {parsedRows.length} תלמידים
            </Button>
          </div>
        </div>
      )}

      {/* Import result summary */}
      {summary && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <p className="font-semibold text-gray-900 mb-3">✅ סיכום ייבוא</p>
          <div className="flex gap-4 flex-wrap mb-3">
            <span className="flex items-center gap-2">
              <Badge variant="success">נוצרו: {summary.created}</Badge>
            </span>
            <span className="flex items-center gap-2">
              <Badge variant="warning">דולגו (כבר קיימים): {summary.skipped}</Badge>
            </span>
            <span className="flex items-center gap-2">
              <Badge variant="danger">שגיאות: {summary.failed}</Badge>
            </span>
          </div>
          {summary.errors.length > 0 && (
            <ul className="text-sm text-red-600 space-y-1">
              {summary.errors.map((e, i) => (
                <li key={i}>שורה {e.row} (ת"ז: {e.nationalId}): {e.message}</li>
              ))}
            </ul>
          )}
          <Button size="sm" variant="ghost" onClick={reset} className="mt-3">
            ייבא קובץ נוסף
          </Button>
        </div>
      )}
    </div>
  );
}
