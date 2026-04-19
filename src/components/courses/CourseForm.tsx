"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createCourse, updateCourse } from "@/actions/courses";
import type { CourseInput } from "@/lib/validations";

interface Instructor {
  id: string;
  fullName: string;
}

interface Coordinator {
  id: string;
  fullName: string;
}

interface CourseFormProps {
  instructors: Instructor[];
  coordinators: Coordinator[];
  defaultValues?: Partial<CourseInput> & { id?: string };
  mode?: "create" | "edit";
}

export function CourseForm({
  instructors,
  coordinators,
  defaultValues,
  mode = "create",
}: CourseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CourseInput>({
    name: defaultValues?.name ?? "",
    description: defaultValues?.description ?? "",
    instructorId: defaultValues?.instructorId ?? "",
    coordinatorId: defaultValues?.coordinatorId ?? "",
    isActive: defaultValues?.isActive ?? true,
  });

  function handleChange(field: keyof CourseInput, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "edit" && defaultValues?.id) {
          await updateCourse(defaultValues.id, form);
        } else {
          await createCourse(form);
        }
        router.push("/courses");
      } catch (err) {
        setError(err instanceof Error ? err.message : "אירעה שגיאה");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Input
        label="שם הקורס *"
        value={form.name}
        onChange={(e) => handleChange("name", e.target.value)}
        placeholder="לדוגמה: עיצוב גרפי רמה א"
        required
      />

      <Input
        label="תיאור (אופציונלי)"
        value={form.description ?? ""}
        onChange={(e) => handleChange("description", e.target.value)}
        placeholder="תיאור קצר של הקורס"
      />

      <Select
        label="מדריך/ה *"
        value={form.instructorId}
        onChange={(e) => handleChange("instructorId", e.target.value)}
        options={instructors.map((i) => ({ value: i.id, label: i.fullName }))}
        placeholder="בחר/י מדריך/ה"
        required
      />

      {coordinators.length > 0 && (
        <Select
          label="רכז/ת"
          value={form.coordinatorId ?? ""}
          onChange={(e) => handleChange("coordinatorId", e.target.value)}
          options={[
            { value: "", label: "ללא רכז/ת" },
            ...coordinators.map((c) => ({ value: c.id, label: c.fullName })),
          ]}
        />
      )}

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isActive"
          checked={form.isActive}
          onChange={(e) => handleChange("isActive", e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-primary-600"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          קורס פעיל
        </label>
      </div>

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
          {mode === "edit" ? "שמור שינויים" : "צור קורס"}
        </Button>
      </div>
    </form>
  );
}
