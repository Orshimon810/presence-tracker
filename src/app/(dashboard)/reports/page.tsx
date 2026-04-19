import Link from "next/link";
import { getReportData } from "@/actions/reports";
import { getCourses } from "@/actions/courses";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { StatsCard } from "@/components/dashboard/StatsCard";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const filters = {
    courseId: params.courseId,
    from: params.from,
    to: params.to,
  };

  const [stats, courses] = await Promise.all([
    getReportData(filters),
    getCourses(),
  ]);

  const chartData = stats.courses.map((c) => ({
    name: c.courseName.length > 12 ? c.courseName.slice(0, 12) + "…" : c.courseName,
    rate: c.avgAttendanceRate,
    sessions: c.totalSessions,
  }));

  // Export URL with current filters
  const exportParams = new URLSearchParams();
  if (filters.courseId) exportParams.set("courseId", filters.courseId);
  if (filters.from) exportParams.set("from", filters.from);
  if (filters.to) exportParams.set("to", filters.to);
  const exportBase = `/api/export/attendance?${exportParams.toString()}`;

  return (
    <div>
      <Header
        title="דוחות וסטטיסטיקות"
        actions={
          <div className="flex gap-2">
            <Link href={`${exportBase}&format=csv`} target="_blank">
              <Button variant="secondary" size="sm">ייצוא CSV</Button>
            </Link>
            <Link href={`${exportBase}&format=xlsx`} target="_blank">
              <Button variant="secondary" size="sm">ייצוא Excel</Button>
            </Link>
          </div>
        }
      />

      {/* Filters */}
      <form className="card p-4 mb-6 flex flex-wrap gap-4 items-end" method="GET">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">קורס</label>
          <select
            name="courseId"
            defaultValue={filters.courseId ?? ""}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">כל הקורסים</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">מתאריך</label>
          <input
            type="date"
            name="from"
            defaultValue={filters.from ?? ""}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">עד תאריך</label>
          <input
            type="date"
            name="to"
            defaultValue={filters.to ?? ""}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          type="submit"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          סנן
        </button>
        {(filters.courseId || filters.from || filters.to) && (
          <Link href="/reports" className="text-sm text-gray-500 hover:text-gray-700">
            נקה סינון
          </Link>
        )}
      </form>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="קורסים"
          value={stats.totalCourses}
          color="blue"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
        />
        <StatsCard
          title="מפגשים"
          value={stats.totalSessions}
          color="purple"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <StatsCard
          title="תלמידים"
          value={stats.totalStudents}
          color="green"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatsCard
          title="ממוצע נוכחות"
          value={`${stats.avgAttendanceRate}%`}
          color={stats.avgAttendanceRate >= 70 ? "green" : "yellow"}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>נוכחות לפי קורס</CardTitle>
          </CardHeader>
          <AttendanceChart data={chartData} />
        </Card>

        {/* Low attendance */}
        <Card>
          <CardHeader>
            <CardTitle>⚠️ תלמידים עם נוכחות נמוכה (מתחת 70%)</CardTitle>
          </CardHeader>
          {stats.lowAttendanceStudents.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              כל התלמידים עם נוכחות סבירה 🎉
            </p>
          ) : (
            <div className="space-y-2">
              {stats.lowAttendanceStudents.map((s) => (
                <div key={s.studentId} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.studentName}</p>
                    <p className="text-xs text-gray-400">
                      נוכח: {s.present} | איחור: {s.late} | נעדר: {s.absent}
                    </p>
                  </div>
                  <Badge variant={s.rate < 50 ? "danger" : "warning"}>{s.rate}%</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Per-course breakdown */}
      {stats.courses.map((course) => (
        <Card key={course.courseId} className="mb-6" padding={false}>
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{course.courseName}</h3>
              <p className="text-sm text-gray-500">
                מדריך: {course.instructorName} · {course.totalSessions} מפגשים · {course.totalStudents} תלמידים
              </p>
            </div>
            <Badge
              variant={
                course.avgAttendanceRate >= 80 ? "success"
                  : course.avgAttendanceRate >= 60 ? "warning"
                  : "danger"
              }
            >
              ממוצע: {course.avgAttendanceRate}%
            </Badge>
          </div>

          {course.students.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-2 text-right font-medium text-gray-600">שם תלמיד/ה</th>
                  <th className="px-5 py-2 text-right font-medium text-gray-600">נוכח</th>
                  <th className="px-5 py-2 text-right font-medium text-gray-600">איחור</th>
                  <th className="px-5 py-2 text-right font-medium text-gray-600">נעדר</th>
                  <th className="px-5 py-2 text-right font-medium text-gray-600">אחוז נוכחות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {course.students.map((s) => (
                  <tr key={s.studentId} className={s.rate < 70 ? "bg-red-50/50" : ""}>
                    <td className="px-5 py-2 font-medium text-gray-900">{s.studentName}</td>
                    <td className="px-5 py-2 text-green-700">{s.present}</td>
                    <td className="px-5 py-2 text-yellow-700">{s.late}</td>
                    <td className="px-5 py-2 text-red-700">{s.absent}</td>
                    <td className="px-5 py-2">
                      <Badge
                        variant={s.rate >= 80 ? "success" : s.rate >= 60 ? "warning" : "danger"}
                      >
                        {s.rate}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      ))}
    </div>
  );
}
