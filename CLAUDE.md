# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                  # Dev server (http://localhost:3000)
npm run build                # Production build — runs `prisma generate` first automatically
npm run lint                 # ESLint

npm run db:push              # Push schema changes without migrations (dev)
npm run db:migrate           # Create a new migration (dev)
npm run db:migrate:deploy    # Apply pending migrations (production)
npm run db:seed              # Seed demo data
npm run db:studio            # Prisma Studio GUI
npm run db:reset             # Drop DB, re-migrate, re-seed
```

There are no automated tests. `npm run build` is the main correctness check.

## Architecture

### Stack
Next.js 15 App Router · TypeScript · Prisma 5 · PostgreSQL (Neon recommended) · NextAuth v5 (Google OAuth only) · Tailwind CSS 3 · Zod · Recharts · SheetJS + PapaParse

### Route layout
- `src/app/(auth)/login/` — Public sign-in page
- `src/app/(dashboard)/` — Protected area; Hebrew RTL sidebar layout
  - `dashboard/` — Stats cards + attendance chart
  - `courses/` — Course list and detail; `[id]/sessions/[sid]/` — Attendance form
  - `students/` — Student table + CSV/Excel import
  - `reports/` — Stats, filters, export, Google Sheets sync button
  - `admin/users/` — Create/delete system users (ADMIN only)
- `src/app/api/auth/` — NextAuth endpoints
- `src/app/api/export/attendance/` — CSV + Excel download
- `src/app/api/sync/sheets/` — Google Sheets sync (Vercel cron + manual trigger)

### Auth flow
`src/auth.ts` — NextAuth config. Google OAuth only. Only users **pre-registered** in the DB by an Admin can sign in — `signIn` callback rejects unknown emails. The user's `role` and `fullName` are injected into the session object here.

`src/middleware.ts` — Runs on **Edge Runtime** so it cannot use Prisma or `auth()`. It checks for the NextAuth session cookie directly and redirects unauthenticated requests to `/login`. Real per-request authorization happens inside server components and Server Actions via `auth()`.

### Server Actions (`src/actions/`)
All CRUD operations are Server Actions, not API routes. Every action calls `auth()` first and filters DB queries by the current user's role:
- ADMIN — unrestricted
- COORDINATOR — sees only courses/instructors assigned to them
- INSTRUCTOR — sees only their own courses

### Data model (key relationships)
```
User (ADMIN | COORDINATOR | INSTRUCTOR)
  └── self-referential: Instructor optionally belongs to one Coordinator
  └── coursesTaught (Course) / coursesCoordinated (Course)

Course → CourseSession[] → Attendance[]
Course → CourseStudent[] ← Student
```
Students are not system users — they have no login. `nationalId` is the unique key for students and is used for CSV/Excel import deduplication.

### Lib utilities (`src/lib/`)
- `prisma.ts` — Singleton Prisma client (dev hot-reload safe)
- `validations.ts` — All Zod schemas (courseSchema, sessionSchema, attendanceSchema, studentSchema, importStudentRowSchema)
- `google-sheets.ts` — Google Sheets sync; **disabled by default** — requires `googleapis` package + service account env vars
- `export.ts` / `import.ts` — SheetJS/PapaParse for CSV and Excel

### Google Sheets sync
Optional feature. To enable: install `googleapis`, create a Google Cloud service account, share the target spreadsheet with the service account, add the three `GOOGLE_SHEETS_*` env vars, and uncomment the marked code in `src/lib/google-sheets.ts`. The Vercel cron (`vercel.json`) triggers `GET /api/sync/sheets` daily at 06:00 UTC; manual sync is also available via the Reports page.

## Role access summary

| Role | Access |
|---|---|
| ADMIN | Full access — users, all courses, attendance, reports |
| COORDINATOR | Their assigned courses and instructors, reports |
| INSTRUCTOR | Their own courses, sessions, attendance, student import |

## Environment variables

Required: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXT_PUBLIC_APP_URL`
Optional (Google Sheets sync): `GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, `GOOGLE_SHEETS_SPREADSHEET_ID`, `CRON_SECRET`
