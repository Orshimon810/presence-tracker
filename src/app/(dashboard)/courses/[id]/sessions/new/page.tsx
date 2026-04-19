"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createCourseSession } from "@/actions/sessions";

export default function NewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: courseId } = use(params);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const session = await createCourseSession({ ...form, courseId });
        router.push(`/courses/${courseId}/sessions/${session.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "אירעה שגיאה");
      }
    });
  }

  return (
    <div className="max-w-xl">
      <Header title="מפגש חדש" subtitle="הוספת מפגש לקורס" />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <Input
            label="שם המפגש *"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="לדוגמה: מפגש פתיחה – היכרות עם כלים"
            required
          />
          <Input
            label="תאריך *"
            type="date"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            required
          />
          <Input
            label="שעת התחלה (אופציונלי)"
            type="time"
            value={form.startTime}
            onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isPending}
            >
              ביטול
            </Button>
            <Button type="submit" loading={isPending}>
              צור מפגש
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
