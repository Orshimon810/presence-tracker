import { PrismaClient, Role, AttendanceStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Users ───────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      fullName: "מנהל ראשי",
      role: Role.ADMIN,
    },
  });

  const coordinator = await prisma.user.upsert({
    where: { email: "coordinator@example.com" },
    update: {},
    create: {
      email: "coordinator@example.com",
      fullName: "רכזת קורסים",
      role: Role.COORDINATOR,
    },
  });

  const instructor1 = await prisma.user.upsert({
    where: { email: "instructor1@example.com" },
    update: {},
    create: {
      email: "instructor1@example.com",
      fullName: "מדריך ראשון",
      role: Role.INSTRUCTOR,
      coordinatorId: coordinator.id,
    },
  });

  const instructor2 = await prisma.user.upsert({
    where: { email: "instructor2@example.com" },
    update: {},
    create: {
      email: "instructor2@example.com",
      fullName: "מדריכה שנייה",
      role: Role.INSTRUCTOR,
      coordinatorId: coordinator.id,
    },
  });

  console.log("✅ Users created");

  // ─── Courses ─────────────────────────────────────────────────────────────
  const course1 = await prisma.course.upsert({
    where: { id: "course-1" },
    update: {},
    create: {
      id: "course-1",
      name: "עיצוב גרפי - רמה א",
      description: "קורס עיצוב גרפי למתחילים",
      instructorId: instructor1.id,
      coordinatorId: coordinator.id,
      isActive: true,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: "course-2" },
    update: {},
    create: {
      id: "course-2",
      name: "פיתוח אתרים - רמה ב",
      description: "קורס פיתוח אתרים מתקדם",
      instructorId: instructor2.id,
      coordinatorId: coordinator.id,
      isActive: true,
    },
  });

  console.log("✅ Courses created");

  // ─── Students ────────────────────────────────────────────────────────────
  const students = await Promise.all([
    prisma.student.upsert({
      where: { nationalId: "123456789" },
      update: {},
      create: {
        fullName: "ישראל ישראלי",
        nationalId: "123456789",
        birthDate: new Date("2000-03-15"),
      },
    }),
    prisma.student.upsert({
      where: { nationalId: "987654321" },
      update: {},
      create: {
        fullName: "שרה כהן",
        nationalId: "987654321",
        birthDate: new Date("1999-07-22"),
      },
    }),
    prisma.student.upsert({
      where: { nationalId: "111222333" },
      update: {},
      create: {
        fullName: "דוד לוי",
        nationalId: "111222333",
        birthDate: new Date("2001-01-10"),
      },
    }),
    prisma.student.upsert({
      where: { nationalId: "444555666" },
      update: {},
      create: {
        fullName: "מרים אברהם",
        nationalId: "444555666",
        birthDate: new Date("1998-11-05"),
      },
    }),
    prisma.student.upsert({
      where: { nationalId: "777888999" },
      update: {},
      create: {
        fullName: "יוסף בן-דוד",
        nationalId: "777888999",
        birthDate: new Date("2002-06-30"),
      },
    }),
  ]);

  console.log("✅ Students created");

  // ─── Enroll students in courses ──────────────────────────────────────────
  for (const student of students.slice(0, 4)) {
    await prisma.courseStudent.upsert({
      where: { courseId_studentId: { courseId: course1.id, studentId: student.id } },
      update: {},
      create: { courseId: course1.id, studentId: student.id },
    });
  }

  for (const student of students.slice(2)) {
    await prisma.courseStudent.upsert({
      where: { courseId_studentId: { courseId: course2.id, studentId: student.id } },
      update: {},
      create: { courseId: course2.id, studentId: student.id },
    });
  }

  console.log("✅ Students enrolled in courses");

  // ─── Sessions ────────────────────────────────────────────────────────────
  const now = new Date();
  const sessions = await Promise.all([
    prisma.courseSession.upsert({
      where: { id: "session-1" },
      update: {},
      create: {
        id: "session-1",
        courseId: course1.id,
        title: "מפגש פתיחה - היכרות עם כלים",
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14),
        startTime: "09:00",
        createdByInstructorId: instructor1.id,
      },
    }),
    prisma.courseSession.upsert({
      where: { id: "session-2" },
      update: {},
      create: {
        id: "session-2",
        courseId: course1.id,
        title: "עיצוב לוגו - עקרונות בסיסיים",
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
        startTime: "09:00",
        createdByInstructorId: instructor1.id,
      },
    }),
    prisma.courseSession.upsert({
      where: { id: "session-3" },
      update: {},
      create: {
        id: "session-3",
        courseId: course2.id,
        title: "HTML ו-CSS - מבוא",
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10),
        startTime: "10:00",
        createdByInstructorId: instructor2.id,
      },
    }),
  ]);

  console.log("✅ Sessions created");

  // ─── Attendance records ──────────────────────────────────────────────────
  const course1Students = students.slice(0, 4);
  const statuses: AttendanceStatus[] = [
    AttendanceStatus.PRESENT,
    AttendanceStatus.PRESENT,
    AttendanceStatus.ABSENT,
    AttendanceStatus.LATE,
  ];

  for (let i = 0; i < course1Students.length; i++) {
    await prisma.attendance.upsert({
      where: {
        sessionId_studentId: {
          sessionId: sessions[0].id,
          studentId: course1Students[i].id,
        },
      },
      update: {},
      create: {
        sessionId: sessions[0].id,
        studentId: course1Students[i].id,
        status: statuses[i],
        updatedByUserId: instructor1.id,
      },
    });
  }

  for (let i = 0; i < course1Students.length; i++) {
    await prisma.attendance.upsert({
      where: {
        sessionId_studentId: {
          sessionId: sessions[1].id,
          studentId: course1Students[i].id,
        },
      },
      update: {},
      create: {
        sessionId: sessions[1].id,
        studentId: course1Students[i].id,
        status: i === 2 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
        updatedByUserId: instructor1.id,
      },
    });
  }

  console.log("✅ Attendance records created");
  console.log("\n🎉 Seed complete!");
  console.log("\n📧 Test accounts (add these emails to your Google OAuth app):");
  console.log("  Admin:       admin@example.com");
  console.log("  Coordinator: coordinator@example.com");
  console.log("  Instructor1: instructor1@example.com");
  console.log("  Instructor2: instructor2@example.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
