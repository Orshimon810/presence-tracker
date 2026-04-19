/**
 * Google Sheets sync module.
 *
 * CURRENT STATE: stub — returns a clear "not configured" response.
 *
 * TO ACTIVATE:
 *   1. npm install googleapis
 *   2. Create a Service Account in Google Cloud Console
 *   3. Share your target Google Sheet with the service account email (Editor role)
 *   4. Add these env vars:
 *        GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL=...
 *        GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 *        GOOGLE_SHEETS_SPREADSHEET_ID=...
 *   5. Uncomment the implementation below and delete the stub.
 */

export interface SheetsSyncResult {
  synced: boolean;
  rows: number;
  message: string;
  timestamp: string;
}

export interface AttendanceSyncRow {
  courseName: string;
  sessionTitle: string;
  sessionDate: string;
  studentName: string;
  nationalId: string;
  status: string;
  note: string;
}

// ─── Stub (safe to ship — does nothing until env vars are set) ────────────────
export async function syncAttendanceToSheets(
  rows: AttendanceSyncRow[]
): Promise<SheetsSyncResult> {
  const isConfigured =
    process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_SHEETS_PRIVATE_KEY &&
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!isConfigured) {
    return {
      synced: false,
      rows: 0,
      message: "Google Sheets not configured. Set GOOGLE_SHEETS_* env vars.",
      timestamp: new Date().toISOString(),
    };
  }

  /* ── Uncomment when ready ──────────────────────────────────────────────────
  const { google } = await import("googleapis");

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;

  // Clear existing data (keep header row)
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "נוכחות!A2:Z",
  });

  // Write header on first run
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "נוכחות!A1",
    valueInputOption: "RAW",
    requestBody: {
      values: [["קורס", "מפגש", "תאריך", "שם תלמיד", "תעודת זהות", "נוכחות", "הערה"]],
    },
  });

  // Write data rows
  if (rows.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "נוכחות!A2",
      valueInputOption: "RAW",
      requestBody: {
        values: rows.map((r) => [
          r.courseName, r.sessionTitle, r.sessionDate,
          r.studentName, r.nationalId, r.status, r.note,
        ]),
      },
    });
  }

  return {
    synced: true,
    rows: rows.length,
    message: `Synced ${rows.length} records to Google Sheets`,
    timestamp: new Date().toISOString(),
  };
  ── End of uncomment block ─────────────────────────────────────────────────── */

  // Temporary return while stub is active
  return {
    synced: false,
    rows: 0,
    message: "Google Sheets sync not yet implemented.",
    timestamp: new Date().toISOString(),
  };
}
