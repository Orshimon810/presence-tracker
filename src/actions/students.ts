"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { studentSchema, type StudentInput } from "@/lib/validations";
import type { ParsedStudent } from "@/lib/import";

async function getSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

export async function getStudentsForCourse(courseId: string) {
  await getSession();
  return prisma.courseStudent.findMany({
    where: { courseId },
    include: { student: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getAllStudents() {
  const userSession = await getSession();
  const { role, id } = userSession.user;

  if (role === "ADMIN") {
    return prisma.student.findMany({ orderBy: { fullName: "asc" } });
  }

  // For instructors: students in their courses
  // For coordinators: students in courses under their instructors
  const courseWhere =
    role === "INSTRUCTOR"
      ? { instructorId: id }
      : { coordinatorId: id };

  const courses = await prisma.course.findMany({
    where: courseWhere,
    include: { students: { include: { student: true } } },
  });

  const seen = new Set<string>();
  const students = [];
  for (const course of courses) {
    for (const cs of course.students) {
      if (!seen.has(cs.student.id)) {
        seen.add(cs.student.id);
        students.push(cs.student);
      }
    }
  }
  return students.sort((a, b) => a.fullName.localeCompare(b.fullName, "he"));
}

export async function createStudent(data: StudentInput, courseId?: string) {
  await getSession();
  const validated = studentSchema.parse(data);

  const student = await prisma.student.upsert({
    where: { nationalId: validated.nationalId },
    update: { fullName: validated.fullName },
    create: {
      fullName: validated.fullName,
      nationalId: validated.nationalId,
      birthDate: validated.birthDate ? new Date(validated.birthDate) : undefined,
    },
  });

  if (courseId) {
    await prisma.courseStudent.upsert({
      where: { courseId_studentId: { courseId, studentId: student.id } },
      update: {},
      create: { courseId, studentId: student.id },
    });
    revalidatePath(`/courses/${courseId}`);
  }

  revalidatePath("/students");
  return student;
}

export async function enrollStudentInCourse(studentId: string, courseId: string) {
  await getSession();
  await prisma.courseStudent.upsert({
    where: { courseId_studentId: { courseId, studentId } },
    update: {},
    create: { courseId, studentId },
  });
  revalidatePath(`/courses/${courseId}`);
}

export async function removeStudentFromCourse(studentId: string, courseId: string) {
  const userSession = await getSession();
  const { role, id } = userSession.user;

  if (role !== "ADMIN") {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true, coordinatorId: true },
    });
    if (!course) throw new Error("Course not found");
    const isOwner =
      (role === "INSTRUCTOR" && course.instructorId === id) ||
      (role === "COORDINATOR" && course.coordinatorId === id);
    if (!isOwner) throw new Error("Forbidden");
  }

  await prisma.courseStudent.delete({
    where: { courseId_studentId: { courseId, studentId } },
  });
  revalidatePath(`/courses/${courseId}`);
}

export interface ImportSummary {
  created: number;
  skipped: number;
  failed: number;
  errors: Array<{ row: number; nationalId?: string; message: string }>;
}

export async function importStudents(
  rows: ParsedStudent[],
  courseId?: string
): Promise<ImportSummary> {
  await getSession();

  let created = 0;
  let skipped = 0;
  let failed = 0;
  const errors: ImportSummary["errors"] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const existing = await prisma.student.findUnique({
        where: { nationalId: row.nationalId },
      });

      let studentId: string;

      if (existing) {
        studentId = existing.id;
        skipped++;
      } else {
        const student = await prisma.student.create({
          data: {
            fullName: row.fullName,
            nationalId: row.nationalId,
            birthDate: row.birthDate ? new Date(row.birthDate) : undefined,
          },
        });
        studentId = student.id;
        created++;
      }

      if (courseId) {
        await prisma.courseStudent.upsert({
          where: { courseId_studentId: { courseId, studentId } },
          update: {},
          create: { courseId, studentId },
        });
      }
    } catch (err) {
      failed++;
      errors.push({
        row: i + 2,
        nationalId: row.nationalId,
        message: err instanceof Error ? err.message : "שגיאה לא ידועה",
      });
    }
  }

  if (courseId) revalidatePath(`/courses/${courseId}`);
  revalidatePath("/students");

  return { created, skipped, failed, errors };
}
