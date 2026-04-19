import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getInstructors, getCoordinators } from "@/actions/users";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { CourseForm } from "@/components/courses/CourseForm";

export default async function NewCoursePage() {
  const session = await auth();
  // Only admins can create courses; instructors create sessions, coordinators only view
  if (session?.user.role !== "ADMIN") redirect("/courses");

  const [instructors, coordinators] = await Promise.all([
    getInstructors(),
    getCoordinators(),
  ]);

  return (
    <div className="max-w-2xl">
      <Header title="קורס חדש" subtitle="הוספת קורס חדש למערכת" />
      <Card>
        <CourseForm instructors={instructors} coordinators={coordinators} />
      </Card>
    </div>
  );
}
