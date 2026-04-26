"use client";

import { useTransition } from "react";
import { removeStudentFromCourse } from "@/actions/students";

interface RemoveStudentButtonProps {
  studentId: string;
  courseId: string;
  studentName: string;
}

export function RemoveStudentButton({ studentId, courseId, studentName }: RemoveStudentButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    if (!confirm(`להסיר את ${studentName} מהקורס?`)) return;
    startTransition(() => removeStudentFromCourse(studentId, courseId));
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-40 mr-auto"
      title="הסר מהקורס"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}
