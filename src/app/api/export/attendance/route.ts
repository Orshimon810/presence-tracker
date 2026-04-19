import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { exportToExcel, exportToCSV, type AttendanceExportRow } from "@/lib/export";
import type { AttendanceStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "xlsx";
  const sessionId = searchParams.get("sessionId");
  const courseId = searchParams.get("courseId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // Build where clause for attendance records
  const sessionWhere: Record<string, unknown> = {};
  if (sessionId) sessionWhere.id = sessionId;
  if (courseId) sessionWhere.courseId = courseId;
  if (from || to) {
    sessionWhere.date = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) }),
    };
  }

  // Scope by role
  const { role, id } = session.user;
  const courseWhere: Record<string, unknown> = {};
  if (role === "INSTRUCTOR") courseWhere.instructorId = id;
  if (role === "COORDINATOR") {
    courseWhere.coordinator = { instructors: { some: { id } } };
  }

  const records = await prisma.attendance.findMany({
    where: {
      session: {
        ...sessionWhere,
        course: courseWhere,
      },
    },
    include: {
      session: {
        include: { course: { select: { name: true } } },
      },
      student: { select: { fullName: true, nationalId: true } },
    },
    orderBy: [{ session: { date: "asc" } }, { student: { fullName: "asc" } }],
  });

  const rows: AttendanceExportRow[] = records.map((r) => ({
    courseName: r.session.course.name,
    sessionTitle: r.session.title,
    sessionDate: r.session.date,
    studentName: r.student.fullName,
    nationalId: r.student.nationalId,
    status: r.status as AttendanceStatus,
    note: r.note,
  }));

  if (format === "csv") {
    const csv = exportToCSV(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="attendance-${Date.now()}.csv"`,
      },
    });
  }

  const buffer = exportToExcel(rows, `attendance-${Date.now()}`);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="attendance-${Date.now()}.xlsx"`,
    },
  });
}
