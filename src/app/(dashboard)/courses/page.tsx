import Link from "next/link";
import { auth } from "@/auth";
import { getCourses } from "@/actions/courses";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { CourseCard } from "@/components/courses/CourseCard";

export default async function CoursesPage() {
  const session = await auth();
  const courses = await getCourses();
  const canCreate = session?.user.role !== "COORDINATOR";

  return (
    <div>
      <Header
        title="קורסים"
        subtitle={`${courses.length} קורסים`}
        actions={
          canCreate ? (
            <Link href="/courses/new">
              <Button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                קורס חדש
              </Button>
            </Link>
          ) : null
        }
      />

      {courses.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-gray-500">אין קורסים עדיין</p>
          {canCreate && (
            <Link href="/courses/new" className="mt-4 inline-block">
              <Button size="sm">צור קורס ראשון</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
