"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/Modal";
import { deleteUser } from "@/actions/users";

interface UserActionsCellProps {
  userId: string;
  userEmail: string;
}

export function UserActionsCell({ userId, userEmail }: UserActionsCellProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      await deleteUser(userId);
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className="text-red-500 hover:text-red-700 text-xs font-medium hover:underline"
      >
        מחק
      </button>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="מחיקת משתמש"
        message={`האם למחוק את ${userEmail}? פעולה זו אינה ניתנת לביטול.`}
        loading={isPending}
      />
    </>
  );
}
