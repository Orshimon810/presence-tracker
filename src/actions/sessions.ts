"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sessionSchema, type SessionInput } from "@/lib/validations";

async function getSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

export async function getSessionsForCourse(courseId: string) {
  await getSession();
  return prisma.courseSession.findMany({
    where: { courseId },
    include: {
      createdByInstructor: { select: { fullName: true } },
      _count: { select: { attendance: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function getCourseSession(sessionId: string) {
  await getSession();
  return prisma.courseSession.findUnique({
    where: { id: sessionId },
    include: {
      course: {
        include: {
          students: { include: { student: true }, orderBy: { createdAt: "asc" } },
        },
      },
      attendance: {
        include: { student: true },
      },
    },
  });
}

export async function createCourseSession(data: SessionInput) {
  const userSession = await getSession();
  const validated = sessionSchema.parse(data);

  // Verify the user has access to this course
  const course = await prisma.course.findUnique({
    where: { id: validated.courseId },
    select: { instructorId: true },
  });
  if (!course) throw new Error("Course not found");
  if (
    userSession.user.role === "INSTRUCTOR" &&
    course.instructorId !== userSession.user.id
  ) {
    throw new Error("Forbidden");
  }

  const newSession = await prisma.courseSession.create({
    data: {
      courseId: validated.courseId,
      title: validated.title,
      date: new Date(validated.date),
      startTime: validated.startTime,
      createdByInstructorId: userSession.user.id,
    },
  });

  revalidatePath(`/courses/${validated.courseId}`);
  return newSession;
}

export async function updateCourseSession(
  sessionId: string,
  data: Partial<SessionInput>
) {
  await getSession();
  const session = await prisma.courseSession.update({
    where: { id: sessionId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.date && { date: new Date(data.date) }),
      ...(data.startTime !== undefined && { startTime: data.startTime }),
    },
  });
  revalidatePath(`/courses/${session.courseId}`);
  return session;
}

export async function deleteCourseSession(sessionId: string) {
  const userSession = await getSession();
  if (userSession.user.role === "COORDINATOR") throw new Error("Forbidden");

  const session = await prisma.courseSession.delete({ where: { id: sessionId } });
  revalidatePath(`/courses/${session.courseId}`);
}
