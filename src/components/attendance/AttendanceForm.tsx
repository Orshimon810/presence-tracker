"use client";

import { useState, useTransition } from "react";
import { saveAttendance, type AttendanceRecord } from "@/actions/attendance";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@prisma/client";

interface Student {
  id: string;
  fullName: string;
  nationalId: string;
}

interface ExistingRecord {
  studentId: string;
  status: AttendanceStatus;
  note?: string | null;
}

interface AttendanceFormProps {
  sessionId: string;
  students: Student[];
  existing: ExistingRecord[];
  readOnly?: boolean;
}

type Status = "PRESENT" | "ABSENT" | "LATE";

const statusButtons: { status: Status; label: string; className: string; activeClass: string }[] = [
  {
    status: "PRESENT",
    label: "נוכח/ת",
    className: "border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700",
    activeClass: "border-green-500 bg-green-50 text-green-700 font-semibold",
  },
  {
    status: "LATE",
    label: "איחור",
    className: "border-gray-200 text-gray-600 hover:border-yellow-300 hover:bg-yellow-50 hover:text-yellow-700",
    activeClass: "border-yellow-500 bg-yellow-50 text-yellow-700 font-semibold",
  },
  {
    status: "ABSENT",
    label: "נעדר/ת",
    className: "border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700",
    activeClass: "border-red-500 bg-red-50 text-red-700 font-semibold",
  },
];

export function AttendanceForm({
  sessionId,
  students,
  existing,
  readOnly = false,
}: AttendanceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build initial state from existing records or default to ABSENT
  const [records, setRecords] = useState<Record<string, { status: Status; note: string }>>(() => {
    const init: Record<string, { status: Status; note: string }> = {};
    for (const student of students) {
      const ex = existing.find((r) => r.studentId === student.id);
      init[student.id] = {
        status: (ex?.status as Status) ?? "ABSENT",
        note: ex?.note ?? "",
      };
    }
    return init;
  });

  // Mark all present with one click
  function markAllPresent() {
    setRecords((prev) => {
      const next = { ...prev };
      for (const id of Object.keys(next)) {
        next[id] = { ...next[id], status: "PRESENT" };
      }
      return next;
    });
  }

  function setStatus(studentId: string, status: Status) {
    setRecords((prev) => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  }

  function setNote(studentId: string, note: string) {
    setRecords((prev) => ({ ...prev, [studentId]: { ...prev[studentId], note } }));
  }

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        const payload: AttendanceRecord[] = students.map((s) => ({
          studentId: s.id,
          status: records[s.id].status,
          note: records[s.id].note || undefined,
        }));
        await saveAttendance(sessionId, payload);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "אירעה שגיאה");
      }
    });
  }

  const presentCount = Object.values(records).filter((r) => r.status === "PRESENT").length;
  const lateCount = Object.values(records).filter((r) => r.status === "LATE").length;
  const absentCount = Object.values(records).filter((r) => r.status === "ABSENT").length;

  if (students.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>אין תלמידים רשומים לקורס זה.</p>
        <p className="text-sm mt-1">הוסף תלמידים בדף הקורס.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="text-green-700 font-medium">✅ {presentCount} נוכחים</span>
        <span className="text-yellow-700 font-medium">⏱ {lateCount} איחור</span>
        <span className="text-red-700 font-medium">❌ {absentCount} נעדרים</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-500">{students.length} סה"כ</span>
        {!readOnly && (
          <Button
            size="sm"
            variant="ghost"
            onClick={markAllPresent}
            className="mr-auto"
          >
            סמן הכל כנוכחים
          </Button>
        )}
      </div>

      {/* Student rows */}
      <div className="space-y-2">
        {students.map((student, idx) => {
          const rec = records[student.id];
          return (
            <div
              key={student.id}
              className={cn(
                "border rounded-xl p-4 transition-colors",
                rec.status === "PRESENT" && "border-green-200 bg-green-50/30",
                rec.status === "LATE" && "border-yellow-200 bg-yellow-50/30",
                rec.status === "ABSENT" && "border-red-200 bg-red-50/30"
              )}
            >
              <div className="flex items-center gap-3 flex-wrap">
                {/* Student number */}
                <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 flex-shrink-0">
                  {idx + 1}
                </span>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{student.fullName}</p>
                  <p className="text-xs text-gray-400">{student.nationalId}</p>
                </div>

                {/* Status buttons */}
                <div className="flex gap-1 flex-shrink-0">
                  {statusButtons.map((btn) => (
                    <button
                      key={btn.status}
                      type="button"
                      disabled={readOnly}
                      onClick={() => setStatus(student.id, btn.status)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border text-xs transition-all",
                        rec.status === btn.status ? btn.activeClass : btn.className,
                        readOnly && "cursor-default opacity-75"
                      )}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note field */}
              {!readOnly && (
                <div className="mt-2 mr-9">
                  <input
                    type="text"
                    value={rec.note}
                    onChange={(e) => setNote(student.id, e.target.value)}
                    placeholder="הערה (אופציונלי)"
                    className="w-full text-sm border-0 border-b border-gray-200 focus:border-primary-400 focus:outline-none bg-transparent py-1 placeholder:text-gray-300"
                  />
                </div>
              )}
              {readOnly && rec.note && (
                <p className="text-xs text-gray-500 mt-1 mr-9 italic">{rec.note}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Save button */}
      {!readOnly && (
        <div className="mt-6 flex items-center justify-between">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && !error && (
            <p className="text-sm text-green-600 font-medium">✅ נשמר בהצלחה</p>
          )}
          <div className="mr-auto flex gap-3">
            <Button onClick={handleSave} loading={isPending} size="lg">
              שמור נוכחות
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
