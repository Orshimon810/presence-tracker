import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCourse } from "@/actions/courses";
import { getInstructors, getCoordinators } from "@/actions/users";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { CourseForm } from "@/components/courses/CourseForm";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, id: userId } = session.user;
  if (role === "COORDINATOR") redirect("/courses");

  let course;
  try {
    course = await getCourse(id);
  } catch {
    notFound();
  }

  // Instructors can only edit their own courses
  if (role === "INSTRUCTOR" && course.instructorId !== userId) redirect("/courses");

  const isAdmin = role === "ADMIN";

  const [instructors, coordinators] = isAdmin
    ? await Promise.all([getInstructors(), getCoordinators()])
    : [[], []];

  return (
    <div className="max-w-2xl">
      <Header title="עריכת קורס" subtitle={course.name} />
      <Card>
        <CourseForm
          instructors={instructors}
          coordinators={coordinators}
          defaultValues={{
            id: course.id,
            name: course.name,
            description: course.description ?? "",
            instructorId: course.instructorId,
            coordinatorId: course.coordinatorId ?? "",
            isActive: course.isActive,
          }}
          mode="edit"
          showAssignmentFields={isAdmin}
        />
      </Card>
    </div>
  );
}
