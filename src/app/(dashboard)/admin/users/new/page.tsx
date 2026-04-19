"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createUser } from "@/actions/users";

export default function NewUserPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "INSTRUCTOR" as "ADMIN" | "COORDINATOR" | "INSTRUCTOR",
    coordinatorId: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createUser({
          ...form,
          coordinatorId: form.coordinatorId || null,
        });
        router.push("/admin/users");
      } catch (err) {
        setError(err instanceof Error ? err.message : "אירעה שגיאה");
      }
    });
  }

  return (
    <div className="max-w-lg">
      <Header title="משתמש חדש" subtitle="הוספת משתמש חדש למערכת" />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
            המשתמש ייכנס למערכת עם חשבון Google באימייל שתזין כאן.
          </div>

          <Input
            label="שם מלא *"
            value={form.fullName}
            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            placeholder="שם פרטי ושם משפחה"
            required
          />
          <Input
            label="אימייל Google *"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="name@gmail.com"
            required
          />
          <Select
            label="תפקיד *"
            value={form.role}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                role: e.target.value as "ADMIN" | "COORDINATOR" | "INSTRUCTOR",
              }))
            }
            options={[
              { value: "INSTRUCTOR", label: "מדריך/ה" },
              { value: "COORDINATOR", label: "רכז/ת" },
              { value: "ADMIN", label: "מנהל/ת" },
            ]}
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
              הוסף משתמש
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
