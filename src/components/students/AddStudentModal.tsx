"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createStudent } from "@/actions/students";

interface AddStudentModalProps {
  courseId: string;
}

export function AddStudentModal({ courseId }: AddStudentModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", nationalId: "", birthDate: "" });

  function reset() {
    setForm({ fullName: "", nationalId: "", birthDate: "" });
    setError(null);
  }

  function handleClose() {
    setOpen(false);
    reset();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createStudent(form, courseId);
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "אירעה שגיאה");
      }
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        + הוסף תלמיד/ה
      </Button>

      <Modal open={open} onClose={handleClose} title="הוספת תלמיד/ה" size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              {error}
            </div>
          )}
          <Input
            label="שם מלא *"
            value={form.fullName}
            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            placeholder="שם פרטי ושם משפחה"
            required
          />
          <Input
            label="תעודת זהות *"
            value={form.nationalId}
            onChange={(e) => setForm((p) => ({ ...p, nationalId: e.target.value }))}
            placeholder="9 ספרות"
            required
          />
          <Input
            label="תאריך לידה"
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm((p) => ({ ...p, birthDate: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={isPending}>
              ביטול
            </Button>
            <Button type="submit" loading={isPending}>
              הוסף תלמיד/ה
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
