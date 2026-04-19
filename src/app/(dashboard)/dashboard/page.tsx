import { auth } from "@/auth";
import { getReportData } from "@/actions/reports";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function DashboardPage() {
  const session = await auth();
  const stats = await getReportData();

  const chartData = stats.courses.map((c) => ({
    name: c.courseName.length > 15 ? c.courseName.slice(0, 15) + "…" : c.courseName,
    rate: c.avgAttendanceRate,
    sessions: c.totalSessions,
  }));

  return (
    <div>
      <Header
        title={`שלום, ${session?.user.fullName} 👋`}
        subtitle="סיכום נוכחות עדכני"
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="קורסים פעילים"
          value={stats.totalCourses}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />
        <StatsCard
          title="מפגשים"
          value={stats.totalSessions}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatsCard
          title="תלמידים"
          value={stats.totalStudents}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatsCard
          title="ממוצע נוכחות"
          value={`${stats.avgAttendanceRate}%`}
          color={stats.avgAttendanceRate >= 70 ? "green" : "yellow"}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>נוכחות לפי קורס</CardTitle>
          </CardHeader>
          <AttendanceChart data={chartData} />
        </Card>

        {/* Low attendance alert */}
        <Card>
          <CardHeader>
            <CardTitle>⚠️ נוכחות נמוכה</CardTitle>
          </CardHeader>
          {stats.lowAttendanceStudents.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">אין תלמידים עם נוכחות נמוכה</p>
          ) : (
            <ul className="space-y-3">
              {stats.lowAttendanceStudents.map((s) => (
                <li key={s.studentId} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.studentName}</p>
                    <p className="text-xs text-gray-500">
                      {s.present}/{s.total} מפגשים
                    </p>
                  </div>
                  <Badge
                    variant={s.rate < 50 ? "danger" : "warning"}
                  >
                    {s.rate}%
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Course summaries */}
      {stats.courses.length > 0 && (
        <Card className="mt-6" padding={false}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">סיכום לפי קורס</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.courses.map((course) => (
              <div key={course.courseId} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{course.courseName}</p>
                  <p className="text-sm text-gray-500">
                    מדריך: {course.instructorName} · {course.totalSessions} מפגשים · {course.totalStudents} תלמידים
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      course.avgAttendanceRate >= 80
                        ? "success"
                        : course.avgAttendanceRate >= 60
                          ? "warning"
                          : "danger"
                    }
                  >
                    {course.avgAttendanceRate}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
