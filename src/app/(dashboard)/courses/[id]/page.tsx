import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getCourse } from "@/actions/courses";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { AddStudentModal } from "@/components/students/AddStudentModal";
import { DeleteCourseButton } from "@/components/courses/DeleteCourseButton";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  let course;
  try {
    course = await getCourse(id);
  } catch {
    notFound();
  }

  const role = session?.user.role;
  const userId = session?.user.id;
  const canEdit = role !== "COORDINATOR";
  const isOwnerOrAdmin = role === "ADMIN" || (role === "INSTRUCTOR" && course.instructorId === userId);

  return (
    <div>
      <Header
        title={course.name}
        subtitle={course.description ?? undefined}
        actions={
          <div className="flex gap-2">
            {canEdit && (
              <Link href={`/courses/${id}/sessions/new`}>
                <Button>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  מפגש חדש
                </Button>
              </Link>
            )}
            {isOwnerOrAdmin && (
              <Link href={`/courses/${id}/edit`}>
                <Button variant="secondary">עריכה</Button>
              </Link>
            )}
            {isOwnerOrAdmin && (
              <DeleteCourseButton courseId={id} courseName={course.name} />
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">מפגשים ({course.sessions.length})</h2>

          {course.sessions.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-8">
                אין מפגשים עדיין.{" "}
                {canEdit && (
                  <Link href={`/courses/${id}/sessions/new`} className="text-primary-600 hover:underline">
                    צור מפגש ראשון
                  </Link>
                )}
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {course.sessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/courses/${id}/sessions/${session.id}`}
                  className="card p-4 flex items-center justify-between hover:shadow-md hover:border-primary-200 transition-all group"
                >
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
                      {session.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(session.date)}
                      {session.startTime && ` · ${session.startTime}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="info">{session._count.attendance} רשומות</Badge>
                    <svg className="w-4 h-4 text-gray-400 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Students sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>תלמידים ({course.students.length})</CardTitle>
              {canEdit && (
                <div className="flex gap-2">
                  <AddStudentModal courseId={id} />
                  <Link href={`/students/import?courseId=${id}`}>
                    <Button size="sm" variant="secondary">
                      ייבוא
                    </Button>
                  </Link>
                </div>
              )}
            </CardHeader>
            {course.students.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">אין תלמידים רשומים</p>
            ) : (
              <ul className="space-y-2 mt-2">
                {course.students.map(({ student }) => (
                  <li key={student.id} className="flex items-center gap-2 text-sm">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-medium text-gray-600">
                      {student.fullName.charAt(0)}
                    </div>
                    <span className="text-gray-800">{student.fullName}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Course info */}
          <Card className="mt-4">
            <CardTitle className="mb-3">פרטי קורס</CardTitle>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">מדריך/ה</dt>
                <dd className="font-medium">{course.instructor.fullName}</dd>
              </div>
              {course.coordinator && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">רכז/ת</dt>
                  <dd className="font-medium">{course.coordinator.fullName}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">סטטוס</dt>
                <dd>
                  <Badge variant={course.isActive ? "success" : "default"}>
                    {course.isActive ? "פעיל" : "לא פעיל"}
                  </Badge>
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
