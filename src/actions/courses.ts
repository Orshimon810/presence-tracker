"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { courseSchema, type CourseInput } from "@/lib/validations";
import type { Role } from "@prisma/client";

async function getSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

/** Return courses scoped to the current user's role */
export async function getCourses() {
  const session = await getSession();
  const { id, role } = session.user;

  const where =
    role === "ADMIN"
      ? {}
      : role === "COORDINATOR"
        ? { coordinatorId: id }
        : { instructorId: id };

  return prisma.course.findMany({
    where,
    include: {
      instructor: { select: { id: true, fullName: true } },
      coordinator: { select: { id: true, fullName: true } },
      _count: { select: { sessions: true, students: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCourse(courseId: string) {
  const session = await getSession();
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: { select: { id: true, fullName: true, email: true } },
      coordinator: { select: { id: true, fullName: true } },
      sessions: {
        orderBy: { date: "desc" },
        include: { _count: { select: { attendance: true } } },
      },
      students: {
        include: { student: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!course) throw new Error("Course not found");
  assertCourseAccess(session.user.role as Role, session.user.id, course);
  return course;
}

export async function createCourse(data: CourseInput) {
  const session = await getSession();
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");

  const validated = courseSchema.parse(data);
  const course = await prisma.course.create({
    data: { ...validated, coordinatorId: validated.coordinatorId || null },
  });
  revalidatePath("/courses");
  return course;
}

export async function updateCourse(courseId: string, data: Partial<CourseInput>) {
  const session = await getSession();
  const { role, id } = session.user;

  if (role === "COORDINATOR") throw new Error("Forbidden");

  if (role === "INSTRUCTOR") {
    const existing = await prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } });
    if (!existing || existing.instructorId !== id) throw new Error("Forbidden");
  }

  const validated = courseSchema.partial().parse(data);
  const course = await prisma.course.update({
    where: { id: courseId },
    data: { ...validated, coordinatorId: validated.coordinatorId || null },
  });
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
  return course;
}

export async function deleteCourse(courseId: string) {
  const session = await getSession();
  const { role, id } = session.user;

  if (role === "COORDINATOR") throw new Error("Forbidden");

  if (role === "INSTRUCTOR") {
    const existing = await prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } });
    if (!existing || existing.instructorId !== id) throw new Error("Forbidden");
  }

  await prisma.course.delete({ where: { id: courseId } });
  revalidatePath("/courses");
}

function assertCourseAccess(
  role: Role,
  userId: string,
  course: { instructorId: string; coordinatorId: string | null }
) {
  if (role === "ADMIN") return;
  if (role === "INSTRUCTOR" && course.instructorId !== userId)
    throw new Error("Forbidden");
  // Coordinator scope is handled at query level
}
