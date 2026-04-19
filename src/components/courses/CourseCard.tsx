import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface CourseCardProps {
  course: {
    id: string;
    name: string;
    description?: string | null;
    isActive: boolean;
    instructor: { fullName: string };
    _count: { sessions: number; students: number };
  };
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="card p-5 block hover:shadow-md hover:border-primary-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
          {course.name}
        </h3>
        <Badge variant={course.isActive ? "success" : "default"}>
          {course.isActive ? "פעיל" : "לא פעיל"}
        </Badge>
      </div>

      {course.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {course.instructor.fullName}
        </span>
        <span>{course._count.sessions} מפגשים</span>
        <span>{course._count.students} תלמידים</span>
      </div>
    </Link>
  );
}
