import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getCourseSession } from "@/actions/sessions";
import { Header } from "@/components/layout/Header";
import { AttendanceForm } from "@/components/attendance/AttendanceForm";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default async function SessionAttendancePage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id: courseId, sessionId } = await params;
  const session = await auth();

  const courseSession = await getCourseSession(sessionId);
  if (!courseSession) notFound();

  const students = courseSession.course.students.map(({ student }) => ({
    id: student.id,
    fullName: student.fullName,
    nationalId: student.nationalId,
  }));

  const existing = courseSession.attendance.map((a) => ({
    studentId: a.studentId,
    status: a.status,
    note: a.note,
  }));

  const readOnly = session?.user.role === "COORDINATOR";

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/courses" className="hover:text-gray-700">קורסים</Link>
        <span>›</span>
        <Link href={`/courses/${courseId}`} className="hover:text-gray-700">
          {courseSession.course.name}
        </Link>
        <span>›</span>
        <span className="text-gray-900">{courseSession.title}</span>
      </div>

      <Header
        title={courseSession.title}
        subtitle={`${formatDate(courseSession.date)}${courseSession.startTime ? ` · ${courseSession.startTime}` : ""}`}
        actions={
          <Link href={`/api/export/attendance?sessionId=${sessionId}`} target="_blank">
            <Button variant="secondary" size="sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              ייצוא Excel
            </Button>
          </Link>
        }
      />

      <div className="card p-6">
        <AttendanceForm
          sessionId={sessionId}
          students={students}
          existing={existing}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
