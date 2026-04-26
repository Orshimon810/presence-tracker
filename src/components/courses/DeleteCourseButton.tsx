"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/Modal";
import { deleteCourse } from "@/actions/courses";
import { Button } from "@/components/ui/Button";

export function DeleteCourseButton({ courseId, courseName }: { courseId: string; courseName: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      await deleteCourse(courseId);
      setConfirmOpen(false);
      router.push("/courses");
    });
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
        מחק קורס
      </Button>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="מחיקת קורס"
        message={`האם למחוק את הקורס "${courseName}"? כל המפגשים ורשומות הנוכחות יימחקו. פעולה זו אינה ניתנת לביטול.`}
        loading={isPending}
      />
    </>
  );
}
