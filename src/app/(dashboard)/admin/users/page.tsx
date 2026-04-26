import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUsers } from "@/actions/users";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RoleBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { UserActionsCell } from "@/components/admin/UserActionsCell";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role === "INSTRUCTOR") redirect("/dashboard");

  const isAdmin = session.user.role === "ADMIN";
  const users = await getUsers();

  return (
    <div>
      <Header
        title={isAdmin ? "ניהול משתמשים" : "המדריכים שלי"}
        subtitle={`${users.length} ${isAdmin ? "משתמשים במערכת" : "מדריכים"}`}
        actions={
          isAdmin ? (
            <Link href="/admin/users/new">
              <Button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                משתמש חדש
              </Button>
            </Link>
          ) : null
        }
      />

      <Card padding={false}>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-3 text-right font-medium text-gray-600">שם</th>
              <th className="px-5 py-3 text-right font-medium text-gray-600">אימייל</th>
              <th className="px-5 py-3 text-right font-medium text-gray-600">תפקיד</th>
              <th className="px-5 py-3 text-right font-medium text-gray-600">רכז/ת</th>
              <th className="px-5 py-3 text-right font-medium text-gray-600">נוסף</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{user.fullName}</td>
                <td className="px-5 py-3 text-gray-500">{user.email}</td>
                <td className="px-5 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-5 py-3 text-gray-500">
                  {user.coordinator?.fullName ?? "—"}
                </td>
                <td className="px-5 py-3 text-gray-400">{formatDate(user.createdAt)}</td>
                <td className="px-5 py-3">
                  <UserActionsCell userId={user.id} userEmail={user.email} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
