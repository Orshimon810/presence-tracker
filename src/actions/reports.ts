"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";

async function getSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

export interface StudentAttendanceStat {
  studentId: string;
  studentName: string;
  nationalId: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  rate: number;
}

export interface CourseAttendanceStat {
  courseId: string;
  courseName: string;
  instructorName: string;
  totalSessions: number;
  totalStudents: number;
  avgAttendanceRate: number;
  students: StudentAttendanceStat[];
}

export interface DashboardStats {
  totalCourses: number;
  totalSessions: number;
  totalStudents: number;
  avgAttendanceRate: number;
  lowAttendanceStudents: StudentAttendanceStat[];
  courses: CourseAttendanceStat[];
}

export async function getReportData(filters?: {
  courseId?: string;
  from?: string;
  to?: string;
}): Promise<DashboardStats> {
  const userSession = await getSession();
  const { role, id } = userSession.user;

  const courseWhere: Record<string, unknown> = {};
  if (role === "INSTRUCTOR") courseWhere.instructorId = id;
  if (role === "COORDINATOR") {
    courseWhere.coordinatorId = id;
  }
  if (filters?.courseId) courseWhere.id = filters.courseId;

  const sessionDateFilter: Record<string, unknown> = {};
  if (filters?.from) sessionDateFilter.gte = new Date(filters.from);
  if (filters?.to) sessionDateFilter.lte = new Date(filters.to);

  const courses = await prisma.course.findMany({
    where: courseWhere,
    include: {
      instructor: { select: { fullName: true } },
      students: {
        include: { student: { select: { id: true, fullName: true, nationalId: true } } },
      },
      sessions: {
        where: Object.keys(sessionDateFilter).length ? { date: sessionDateFilter } : undefined,
        include: { attendance: true },
      },
    },
  });

  let totalPresent = 0;
  let totalAttendance = 0;
  const courseStats: CourseAttendanceStat[] = [];

  for (const course of courses) {
    const studentStatsMap = new Map<string, StudentAttendanceStat>();

    // Initialize from enrolled students
    for (const cs of course.students) {
      studentStatsMap.set(cs.student.id, {
        studentId: cs.student.id,
        studentName: cs.student.fullName,
        nationalId: cs.student.nationalId,
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        rate: 0,
      });
    }

    for (const session of course.sessions) {
      for (const att of session.attendance) {
        const stat = studentStatsMap.get(att.studentId);
        if (!stat) continue;
        stat.total++;
        if (att.status === AttendanceStatus.PRESENT) { stat.present++; totalPresent++; }
        if (att.status === AttendanceStatus.ABSENT) stat.absent++;
        if (att.status === AttendanceStatus.LATE) { stat.late++; totalPresent++; }
        totalAttendance++;
      }
    }

    const students = Array.from(studentStatsMap.values()).map((s) => ({
      ...s,
      rate: s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : 0,
    }));

    const avgRate =
      students.length > 0
        ? Math.round(students.reduce((sum, s) => sum + s.rate, 0) / students.length)
        : 0;

    courseStats.push({
      courseId: course.id,
      courseName: course.name,
      instructorName: course.instructor.fullName,
      totalSessions: course.sessions.length,
      totalStudents: course.students.length,
      avgAttendanceRate: avgRate,
      students,
    });
  }

  const allStudents = courseStats.flatMap((c) => c.students);
  const lowAttendance = allStudents
    .filter((s) => s.total >= 2 && s.rate < 70)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 10);

  return {
    totalCourses: courses.length,
    totalSessions: courses.reduce((sum, c) => sum + c.sessions.length, 0),
    totalStudents: new Set(courses.flatMap((c) => c.students.map((s) => s.studentId))).size,
    avgAttendanceRate:
      totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0,
    lowAttendanceStudents: lowAttendance,
    courses: courseStats,
  };
}
