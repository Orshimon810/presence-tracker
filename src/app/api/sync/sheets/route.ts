import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { syncAttendanceToSheets, type AttendanceSyncRow } from "@/lib/google-sheets";
import { attendanceStatusLabel, formatDate } from "@/lib/utils";

/**
 * GET /api/sync/sheets
 *
 * Triggers a Google Sheets sync of all attendance data.
 * Can be called:
 *   1. By Vercel Cron (vercel.json — daily at 06:00 UTC) — uses CRON_SECRET header
 *   2. By a logged-in Admin via the Reports page sync button
 *   3. By any external cron service (cron-job.org etc.) — pass ?secret=CRON_SECRET
 */
export async function GET(req: NextRequest) {
  // Auth: accept either a logged-in admin OR a valid cron secret
  const cronSecret = process.env.CRON_SECRET;
  const headerSecret = req.headers.get("authorization")?.replace("Bearer ", "");
  const querySecret = req.nextUrl.searchParams.get("secret");

  const isValidCron =
    cronSecret && (headerSecret === cronSecret || querySecret === cronSecret);

  if (!isValidCron) {
    // Fall back to session check
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Fetch all attendance with related data
    const records = await prisma.attendance.findMany({
      include: {
        session: { include: { course: { select: { name: true } } } },
        student: { select: { fullName: true, nationalId: true } },
      },
      orderBy: [{ session: { date: "asc" } }, { student: { fullName: "asc" } }],
    });

    const rows: AttendanceSyncRow[] = records.map((r) => ({
      courseName: r.session.course.name,
      sessionTitle: r.session.title,
      sessionDate: formatDate(r.session.date),
      studentName: r.student.fullName,
      nationalId: r.student.nationalId,
      status: attendanceStatusLabel(r.status),
      note: r.note ?? "",
    }));

    const result = await syncAttendanceToSheets(rows);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[sync/sheets]", err);
    return NextResponse.json(
      { error: "Sync failed", detail: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}
