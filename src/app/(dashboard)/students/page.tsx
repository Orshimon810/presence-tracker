import Link from "next/link";
import { auth } from "@/auth";
import { getAllStudents } from "@/actions/students";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export default async function StudentsPage() {
  const session = await auth();
  const students = await getAllStudents();
  const canImport = session?.user.role !== "COORDINATOR";

  return (
    <div>
      <Header
        title="תלמידים"
        subtitle={`${students.length} תלמידים במערכת`}
        actions={
          canImport ? (
            <Link href="/students/import">
              <Button variant="secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                ייבוא מקובץ
              </Button>
            </Link>
          ) : null
        }
      />

      <Card padding={false}>
        {students.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>אין תלמידים עדיין</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-right font-medium text-gray-600">שם מלא</th>
                <th className="px-5 py-3 text-right font-medium text-gray-600">תעודת זהות</th>
                <th className="px-5 py-3 text-right font-medium text-gray-600">תאריך לידה</th>
                <th className="px-5 py-3 text-right font-medium text-gray-600">נוסף</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{student.fullName}</td>
                  <td className="px-5 py-3 font-mono text-gray-500">{student.nationalId}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {student.birthDate ? formatDate(student.birthDate) : "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-400">{formatDate(student.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
