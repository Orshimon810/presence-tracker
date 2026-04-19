# מערכת נוכחות — Presence Tracker

מערכת ניהול נוכחות תלמידים בקורסים, בנויה עם Next.js 15, Prisma, PostgreSQL ו-NextAuth v5.

## טכנולוגיות

- **Framework:** Next.js 15 (App Router, standalone output)
- **Language:** TypeScript
- **ORM:** Prisma 5
- **Database:** PostgreSQL
- **Auth:** NextAuth v5 — Google OAuth בלבד
- **Styling:** Tailwind CSS 3
- **Charts:** Recharts
- **Excel/CSV:** SheetJS + PapaParse
- **Validation:** Zod
- **Container:** Docker (multi-stage build)

---

## מבנה הפרויקט

```
src/
├── app/
│   ├── (auth)/login/          ← Google sign-in page
│   ├── (dashboard)/           ← Protected area (RTL Hebrew sidebar)
│   │   ├── dashboard/         ← Stats cards + attendance chart
│   │   ├── courses/           ← Course list, detail, session list
│   │   ├── courses/[id]/sessions/[sid]/  ← Attendance form
│   │   ├── students/          ← Student table + CSV/Excel import
│   │   ├── reports/           ← Stats, filters, export, Sheets sync
│   │   └── admin/users/       ← Create/delete system users
│   └── api/
│       ├── auth/              ← NextAuth endpoints
│       ├── export/attendance/ ← CSV + Excel download
│       └── sync/sheets/       ← Google Sheets sync (cron + manual)
├── actions/                   ← Server Actions (CRUD, role-scoped)
├── components/                ← UI kit, layout, forms, charts
├── lib/                       ← prisma, utils, export, import, google-sheets
└── types/
prisma/
├── schema.prisma              ← Data model
└── seed.ts                    ← Demo data
```

---

## הגדרת סביבה מקומית

### דרישות
- Node.js 20+
- PostgreSQL (ראה מטה לפרטים) **או** Docker

### התקנה

```bash
git clone https://github.com/Orshimon810/presence-tracker.git
cd presence-tracker
npm install
cp .env.example .env
# ערוך את .env עם הפרטים שלך
npm run db:push    # דחיפת סכמה למסד הנתונים
npm run db:seed    # נתוני demo
npm run dev        # http://localhost:3000
```

### הוספת משתמש Admin

לאחר הרצת `db:seed`, הוסף את אימייל ה-Google שלך:

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.upsert({
  where: { email: 'YOUR@gmail.com' },
  update: { role: 'ADMIN' },
  create: { email: 'YOUR@gmail.com', fullName: 'שמך', role: 'ADMIN' }
}).then(() => p.\$disconnect())
"
```

---

## ☁️ מסד נתונים מומלץ (חינמי)

### ✅ Neon — המלצה ראשונה

הפרויקט כבר משתמש ב-Neon. זהו ה-PostgreSQL החינמי הטוב ביותר ל-Next.js:
- **חינמי לצמיתות** (0.5 GB, ענף אחד)
- Serverless — מתעורר אוטומטית
- Connection pooling מובנה
- ממשק web נוח

**התחלה:** [neon.tech](https://neon.tech) → Create project → העתק connection string

### אלטרנטיבות
| שירות | תוכנית חינמית | מגבלות |
|---|---|---|
| **Supabase** | 500 MB, 2 פרויקטים | נכבה אחרי 1 שבוע idle |
| **Railway** | $5 credit/חודש | מוגבל בזמן |
| **Render** | PostgreSQL חינמי | נכבה אחרי 90 יום |

---

## 🚀 פריסה — Vercel (מומלץ)

Vercel הוא הבחירה הטובה ביותר עם Next.js — פשוט, מהיר, חינמי.

### שלב 1 — חבר GitHub

1. היכנס ל-[vercel.com](https://vercel.com)
2. **Add New → Project → Import Git Repository**
3. בחר `Orshimon810/presence-tracker`
4. **Framework Preset:** Next.js (יזוהה אוטומטית)

### שלב 2 — הגדר Environment Variables

ב-Vercel Dashboard → Settings → Environment Variables, הוסף:

| Variable | Value |
|---|---|
| `DATABASE_URL` | connection string מ-Neon (עם `?sslmode=require`) |
| `AUTH_SECRET` | הרץ `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `AUTH_URL` | `https://your-app.vercel.app` |
| `AUTH_GOOGLE_ID` | מ-Google Cloud Console |
| `AUTH_GOOGLE_SECRET` | מ-Google Cloud Console |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `CRON_SECRET` | `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"` |

### שלב 3 — הוסף Redirect URI ל-Google OAuth

ב-[console.cloud.google.com](https://console.cloud.google.com) → Credentials → OAuth Client:
```
https://your-app.vercel.app/api/auth/callback/google
```

### שלב 4 — הגדר Build Command

ב-Vercel → Settings → General → Build & Output Settings:
```
Build Command:   npm run build
Output Directory: .next (ברירת מחדל)
```

הפקודה `npm run build` כוללת `prisma generate` אוטומטית.

### שלב 5 — הרץ Migrations

לאחר הפריסה הראשונה, הרץ מ-terminal:
```bash
DATABASE_URL="your-neon-url" npx prisma migrate deploy
```

**או** הוסף ל-Vercel Build Command:
```
npx prisma migrate deploy && npm run build
```

### שלב 6 — Deploy

לחץ **Deploy** — Vercel יבנה ויפרוס אוטומטית בכל push ל-main.

### Vercel Cron

ה-`vercel.json` כבר מוגדר לסנכרון Google Sheets ב-06:00 UTC כל יום:
```json
{ "crons": [{ "path": "/api/sync/sheets", "schedule": "0 6 * * *" }] }
```
> דורש Vercel Pro לשימוש בייצור. בחינמי — ניתן להשתמש בכפתור הסנכרון הידני בדף הדוחות.

### בעיות נפוצות — Vercel

| בעיה | פתרון |
|---|---|
| `PrismaClientInitializationError` | ודא ש-`DATABASE_URL` מוגדר עם `?sslmode=require` |
| Redirect loop בלוגין | ודא ש-`AUTH_URL` זהה לדומיין הנפרס |
| `OAuthAccountNotLinked` | האימייל לא קיים ב-DB — הוסף דרך Prisma Studio או סקריפט |
| Build fails — Prisma | ודא שהפקודה `prisma generate` רצה לפני `next build` (כבר מוגדר) |

---

## 🐳 פריסה — Render

### אפשרות A: Web Service (Docker)

1. היכנס ל-[render.com](https://render.com) → **New → Web Service**
2. חבר GitHub repo
3. הגדרות:
   ```
   Environment:    Docker
   Dockerfile:     ./Dockerfile
   Instance Type:  Free (או Starter לייצור)
   ```
4. הוסף Environment Variables (כמו Vercel למעלה)
5. **Create Web Service**

### אפשרות B: Web Service (Node.js — ללא Docker)

```
Environment:      Node
Build Command:    npm install && npm run build
Start Command:    node .next/standalone/server.js
Node Version:     20
```

### PostgreSQL ב-Render

1. **New → PostgreSQL** → בחר Free plan
2. העתק **Internal Database URL** ל-`DATABASE_URL` של ה-Web Service
3. Render מחבר אותם אוטומטית

### הרצת Migrations ב-Render

ב-Render → Web Service → **Shell**:
```bash
npx prisma migrate deploy
```

### בעיות נפוצות — Render

| בעיה | פתרון |
|---|---|
| Cold start איטי | Free tier נכבה אחרי 15 דקות idle — שדרג ל-Starter |
| Database connection failed | השתמש ב-Internal URL (לא External) לחיבור בין Services |
| Build timeout | הגדל timeout ב-Settings, או עבור לשכבת Starter |

---

## 🐳 Docker — הרצה מקומית

### הרצה מהירה עם docker compose

```bash
# העתק .env ומלא AUTH_GOOGLE_* ו-AUTH_SECRET (DATABASE_URL מוגדר אוטומטית)
cp .env.example .env

# בנה והפעל (Postgres + App)
docker compose up --build

# הרץ migrations + seed (פעם ראשונה)
docker compose exec app npx prisma migrate deploy
docker compose exec app npx tsx prisma/seed.ts
```

פתח http://localhost:3000

### הרצת Postgres בלבד (לפיתוח עם npm run dev)

```bash
docker compose up db
# DATABASE_URL=postgresql://presence:presence@localhost:5432/presence_tracker
npm run dev
```

### בנייה ידנית של Docker image

```bash
docker build -t presence-tracker .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_SECRET="..." \
  -e AUTH_URL="http://localhost:3000" \
  -e AUTH_GOOGLE_ID="..." \
  -e AUTH_GOOGLE_SECRET="..." \
  presence-tracker
```

---

## 📊 סנכרון Google Sheets

### אפשרות 1 — כפתור ידני (כבר קיים)

בדף הדוחות יש כפתור "סנכרון Google Sheets". לחיצה קוראת ל-`GET /api/sync/sheets`.

### אפשרות 2 — Cron אוטומטי (Vercel)

מוגדר ב-`vercel.json` — רץ כל יום ב-06:00 UTC.

### אפשרות 3 — Cron חיצוני (חינמי)

השתמש ב-[cron-job.org](https://cron-job.org) (חינמי):
- URL: `https://your-app.vercel.app/api/sync/sheets?secret=YOUR_CRON_SECRET`
- Method: GET
- Schedule: לפי בחירה

### הפעלת Google Sheets sync

```bash
# 1. התקן googleapis
npm install googleapis

# 2. צור Service Account ב-Google Cloud Console
#    → APIs & Services → Credentials → Service Account
#    → הפעל "Google Sheets API"
#    → שתף את ה-Spreadsheet עם אימייל ה-Service Account (Editor)

# 3. הוסף ל-.env
GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL="sync@project.iam.gserviceaccount.com"
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID="spreadsheet-id-from-url"
CRON_SECRET="random-secret"

# 4. ב-src/lib/google-sheets.ts — בטל הערה מהקוד המסומן
```

---

## פקודות שימושיות

```bash
npm run dev                  # שרת פיתוח
npm run build                # בנייה לייצור (כולל prisma generate)
npm run db:push              # דחיפת סכמה (פיתוח)
npm run db:migrate           # יצירת migration חדש
npm run db:migrate:deploy    # החלת migrations (ייצור)
npm run db:seed              # נתוני demo
npm run db:studio            # Prisma Studio (UI למסד)
npm run db:reset             # איפוס מלא + seed
```

---

## תפקידים

| תפקיד | גישה |
|---|---|
| `ADMIN` | גישה מלאה — משתמשים, קורסים, נוכחות, דוחות |
| `COORDINATOR` | צפייה בקורסים ומדריכים תחתיו, דוחות |
| `INSTRUCTOR` | ניהול הקורסים שלו, מפגשים, נוכחות, ייבוא תלמידים |

**חשוב:** כל המשתמשים חייבים להירשם מראש על ידי Admin — תלמידים אינם נכנסים למערכת.
