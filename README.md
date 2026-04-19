# מערכת נוכחות — Presence Tracker

מערכת ניהול נוכחות תלמידים בקורסים, בנויה עם Next.js 15, Prisma, PostgreSQL ו-NextAuth v5.

## טכנולוגיות

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **ORM:** Prisma 5
- **Database:** PostgreSQL
- **Auth:** NextAuth v5 (Auth.js) — Google OAuth בלבד
- **Styling:** Tailwind CSS 3
- **Charts:** Recharts
- **Excel/CSV:** SheetJS (xlsx) + PapaParse
- **Validation:** Zod

---

## התקנה מקומית

### דרישות מקדימות

- Node.js 18+
- PostgreSQL (מקומי או Supabase/Neon/Railway)
- חשבון Google Cloud עם OAuth2 מוגדר

### שלבי התקנה

```bash
# 1. שכפל את הפרויקט
git clone <repo-url>
cd presence-tracker

# 2. התקן תלויות
npm install

# 3. הגדר משתני סביבה
cp .env.example .env
# ערוך את .env עם הפרטים שלך

# 4. הכן את מסד הנתונים
npm run db:push

# 5. טען נתוני demo
npm run db:seed

# 6. הפעל את השרת המקומי
npm run dev
```

פתח http://localhost:3000 בדפדפן.

---

## הגדרת Google OAuth

1. היכנס ל-[Google Cloud Console](https://console.cloud.google.com/)
2. צור פרויקט חדש
3. עבור ל-**APIs & Services → Credentials**
4. לחץ **Create Credentials → OAuth 2.0 Client IDs**
5. בחר **Web application**
6. הוסף Authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. העתק את Client ID ו-Client Secret ל-.env

---

## משתני סביבה

```env
DATABASE_URL="postgresql://user:password@localhost:5432/presence_tracker"
AUTH_SECRET="your-secret"          # הרץ: openssl rand -base64 32
AUTH_URL="http://localhost:3000"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

---

## תפקידים

| תפקיד      | גישה                                                          |
|------------|---------------------------------------------------------------|
| ADMIN      | גישה מלאה לכל המערכת                                         |
| COORDINATOR| צפייה בקורסים ומדריכים תחתיו, דוחות                        |
| INSTRUCTOR | ניהול הקורסים שלו, מפגשים, נוכחות, ייבוא תלמידים            |

---

## הוספת משתמשים

**כל המשתמשים חייבים להירשם מראש על ידי מנהל.**  
תלמידים אינם נכנסים למערכת — רק צוות.

1. הכנס כמנהל
2. עבור לדף **ניהול משתמשים**
3. הוסף משתמש חדש עם האימייל של חשבון ה-Google שלו

---

## מבנה הפרויקט

```
src/
├── app/
│   ├── (auth)/           # דפי התחברות
│   ├── (dashboard)/      # כל הדפים המוגנים
│   │   ├── dashboard/    # לוח בקרה
│   │   ├── courses/      # קורסים ומפגשים
│   │   ├── students/     # תלמידים וייבוא
│   │   ├── reports/      # דוחות וסטטיסטיקות
│   │   └── admin/        # ניהול משתמשים
│   └── api/
│       ├── auth/         # NextAuth endpoints
│       └── export/       # ייצוא CSV/Excel
├── actions/              # Server Actions
├── components/           # React components
├── lib/                  # Utilities, export, import
└── types/                # TypeScript types
prisma/
├── schema.prisma         # Data model
└── seed.ts               # Demo data
```

---

## סנכרון Google Sheets (עתידי)

הקובץ `src/lib/export.ts` מכיל stub לפונקציית `syncToGoogleSheets`.  
להטמעה מלאה:
1. התקן: `npm install googleapis`
2. הגדר Service Account ב-Google Cloud
3. הוסף את המשתנים `GOOGLE_SHEETS_*` ל-.env
4. מלא את הפונקציה ב-`src/lib/export.ts`

---

## פקודות שימושיות

```bash
npm run dev          # שרת פיתוח
npm run build        # בנייה לייצור
npm run db:studio    # Prisma Studio (UI למסד הנתונים)
npm run db:seed      # טעינת נתוני demo
npm run db:reset     # איפוס מסד נתונים + seed
npm run lint         # בדיקת קוד
```
