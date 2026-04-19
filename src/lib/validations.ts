import { z } from "zod";

export const courseSchema = z.object({
  name: z.string().min(2, "שם הקורס חייב להכיל לפחות 2 תווים"),
  description: z.string().optional(),
  instructorId: z.string().min(1, "יש לבחור מדריך"),
  coordinatorId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const sessionSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(2, "שם המפגש חייב להכיל לפחות 2 תווים"),
  date: z.string().min(1, "יש לבחור תאריך"),
  startTime: z.string().optional(),
});

export const attendanceSchema = z.object({
  sessionId: z.string().min(1),
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.enum(["PRESENT", "ABSENT", "LATE"]),
      note: z.string().optional(),
    })
  ),
});

export const studentSchema = z.object({
  fullName: z.string().min(2, "שם מלא חייב להכיל לפחות 2 תווים"),
  nationalId: z
    .string()
    .min(5, "תעודת זהות חייבת להכיל לפחות 5 ספרות")
    .regex(/^\d+$/, "תעודת זהות חייבת להכיל ספרות בלבד"),
  birthDate: z.string().optional(),
});

export const importStudentRowSchema = z.object({
  fullName: z.string().min(1, "שם מלא חסר"),
  nationalId: z
    .string()
    .min(1, "תעודת זהות חסרה")
    .regex(/^\d+$/, "תעודת זהות לא תקינה"),
  birthDate: z.string().optional(),
});

export const userSchema = z.object({
  fullName: z.string().min(2, "שם מלא חייב להכיל לפחות 2 תווים"),
  email: z.string().email("כתובת אימייל לא תקינה"),
  role: z.enum(["ADMIN", "COORDINATOR", "INSTRUCTOR"]),
  coordinatorId: z.string().optional().nullable(),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type SessionInput = z.infer<typeof sessionSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type UserInput = z.infer<typeof userSchema>;
