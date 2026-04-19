"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { attendanceSchema } from "@/lib/validations";
import type { AttendanceStatus } from "@prisma/client";

async function getSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export async function saveAttendance(
  sessionId: string,
  records: AttendanceRecord[]
) {
  const userSession = await getSession();

  const validated = attendanceSchema.parse({ sessionId, records });

  // Upsert each record
  await Promise.all(
    validated.records.map((record) =>
      prisma.attendance.upsert({
        where: {
          sessionId_studentId: {
            sessionId: validated.sessionId,
            studentId: record.studentId,
          },
        },
        create: {
          sessionId: validated.sessionId,
          studentId: record.studentId,
          status: record.status as AttendanceStatus,
          note: record.note,
          updatedByUserId: userSession.user.id,
        },
        update: {
          status: record.status as AttendanceStatus,
          note: record.note,
          updatedByUserId: userSession.user.id,
        },
      })
    )
  );

  const session = await prisma.courseSession.findUnique({
    where: { id: sessionId },
    select: { courseId: true },
  });

  revalidatePath(`/courses/${session?.courseId}/sessions/${sessionId}`);
  return { success: true };
}

export async function getAttendanceForSession(sessionId: string) {
  await getSession();
  return prisma.attendance.findMany({
    where: { sessionId },
    include: { student: true, updatedByUser: { select: { fullName: true } } },
  });
}

export async function getAttendanceStats(filters?: {
  courseId?: string;
  instructorId?: string;
  coordinatorId?: string;
  from?: Date;
  to?: Date;
}) {
  const userSession = await getSession();
  const { role, id } = userSession.user;

  // Build session filter based on role
  const sessionWhere: Record<string, unknown> = {};
  if (filters?.from || filters?.to) {
    sessionWhere.date = {
      ...(filters.from && { gte: filters.from }),
      ...(filters.to && { lte: filters.to }),
    };
  }

  const courseWhere: Record<string, unknown> = {};
  if (filters?.courseId) courseWhere.id = filters.courseId;
  if (role === "INSTRUCTOR") courseWhere.instructorId = id;
  if (role === "COORDINATOR") {
    courseWhere.coordinatorId = id;
  }
  if (filters?.instructorId) courseWhere.instructorId = filters.instructorId;

  const courses = await prisma.course.findMany({
    where: courseWhere,
    include: {
      instructor: { select: { id: true, fullName: true } },
      sessions: {
        where: sessionWhere,
        include: {
          attendance: {
            include: { student: { select: { id: true, fullName: true } } },
          },
        },
      },
      students: { include: { student: { select: { id: true, fullName: true } } } },
    },
  });

  return courses;
}
