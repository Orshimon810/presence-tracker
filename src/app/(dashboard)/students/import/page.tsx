import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { ImportStudents } from "@/components/students/ImportStudents";

export default async function ImportStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const params = await searchParams;
  const courseId = params.courseId;

  return (
    <div className="max-w-2xl">
      <Header
        title="ייבוא תלמידים"
        subtitle={
          courseId
            ? "ייבוא תלמידים מקובץ ושיבוצם לקורס"
            : "ייבוא תלמידים מקובץ CSV או Excel"
        }
      />
      <Card>
        <ImportStudents courseId={courseId} />
      </Card>
    </div>
  );
}
