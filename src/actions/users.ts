"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { userSchema, type UserInput } from "@/lib/validations";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}

export async function getUsers() {
  await requireAdmin();
  return prisma.user.findMany({
    include: {
      coordinator: { select: { fullName: true } },
      _count: { select: { coursesTaught: true, instructors: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInstructors() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const { role, id } = session.user;

  const where =
    role === "ADMIN"
      ? { role: "INSTRUCTOR" as const }
      : { role: "INSTRUCTOR" as const, coordinatorId: id };

  return prisma.user.findMany({ where, orderBy: { fullName: "asc" } });
}

export async function getCoordinators() {
  await requireAdmin();
  return prisma.user.findMany({
    where: { role: "COORDINATOR" },
    orderBy: { fullName: "asc" },
  });
}

export async function createUser(data: UserInput) {
  await requireAdmin();
  const validated = userSchema.parse(data);

  const user = await prisma.user.create({
    data: {
      fullName: validated.fullName,
      email: validated.email,
      role: validated.role,
      coordinatorId: validated.coordinatorId ?? null,
    },
  });

  revalidatePath("/admin/users");
  return user;
}

export async function updateUser(userId: string, data: Partial<UserInput>) {
  await requireAdmin();
  const validated = userSchema.partial().parse(data);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(validated.fullName && { fullName: validated.fullName }),
      ...(validated.email && { email: validated.email }),
      ...(validated.role && { role: validated.role }),
      coordinatorId: validated.coordinatorId ?? null,
    },
  });

  revalidatePath("/admin/users");
  return user;
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}
