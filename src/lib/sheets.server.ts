// Server-only Google Sheets access through the Lovable connector gateway.
// Credentials never reach the browser.

const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing server configuration: ${name}`);
  return v;
}

export function spreadsheetId() {
  return env("GOOGLE_SHEETS_SPREADSHEET_ID");
}

async function gateway<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env("LOVABLE_API_KEY")}`,
      "X-Connection-Api-Key": env("GOOGLE_SHEETS_API_KEY"),
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Google Sheets request failed [${res.status}]: ${body}`);
    throw new Error(`Google Sheets request failed [${res.status}]: ${body}`);
  }
  return (await res.json()) as T;
}

export function colLetter(index0: number): string {
  let n = index0 + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export async function getValues(tab: string, range = "A1:BZ2000"): Promise<string[][]> {
  const data = await gateway<{ values?: string[][] }>(
    `/spreadsheets/${spreadsheetId()}/values/${tab}!${range}?valueRenderOption=UNFORMATTED_VALUE`,
  );
  return (data.values ?? []).map((r) => r.map((c) => (c === null ? "" : String(c))));
}

export async function updateRange(tab: string, a1: string, values: (string | number)[][]) {
  return gateway(
    `/spreadsheets/${spreadsheetId()}/values/${tab}!${a1}?valueInputOption=USER_ENTERED`,
    { method: "PUT", body: JSON.stringify({ values }) },
  );
}

export async function appendRow(tab: string, values: (string | number)[]) {
  return gateway(
    `/spreadsheets/${spreadsheetId()}/values/${tab}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: JSON.stringify({ values: [values] }) },
  );
}

export async function getSheetIdByTitle(title: string): Promise<number> {
  const meta = await gateway<{
    sheets: { properties: { sheetId: number; title: string } }[];
  }>(`/spreadsheets/${spreadsheetId()}?fields=sheets.properties`);
  const found = meta.sheets.find((s) => s.properties.title === title);
  if (!found) throw new Error(`Sheet tab "${title}" not found`);
  return found.properties.sheetId;
}

export async function insertColumn(tab: string, atIndex0: number) {
  const sheetId = await getSheetIdByTitle(tab);
  return gateway(`/spreadsheets/${spreadsheetId()}:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({
      requests: [
        {
          insertDimension: {
            range: {
              sheetId,
              dimension: "COLUMNS",
              startIndex: atIndex0,
              endIndex: atIndex0 + 1,
            },
            inheritFromBefore: false,
          },
        },
      ],
    }),
  });
}
