// Server-only Google Sheets access through the Lovable connector gateway.
// Credentials never reach the browser.
//
// Each branch has its OWN spreadsheet with two tabs: SALES and INVENTORY.
// App-level tab keys (AZAD_SALES, ...) resolve to a spreadsheet + tab name.

const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

const TAB_TARGETS: Record<string, { idEnv: string; tab: string }> = {
  AZAD_SALES: { idEnv: "AZAD_SPREADSHEET_ID", tab: "SALES" },
  AZAD_INVENTORY: { idEnv: "AZAD_SPREADSHEET_ID", tab: "INVENTORY" },
  ROSHAN_SALES: { idEnv: "ROSHAN_SPREADSHEET_ID", tab: "SALES" },
  ROSHAN_INVENTORY: { idEnv: "ROSHAN_SPREADSHEET_ID", tab: "INVENTORY" },
};

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing server configuration: ${name}`);
  return v;
}

function resolveTab(tabKey: string): { spreadsheetId: string; tab: string } {
  const target = TAB_TARGETS[tabKey];
  if (!target) throw new Error(`Unknown sheet tab: ${tabKey}`);
  return { spreadsheetId: env(target.idEnv), tab: target.tab };
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

export async function getValues(tabKey: string, range = "A1:BZ2000"): Promise<string[][]> {
  const { spreadsheetId, tab } = resolveTab(tabKey);
  const data = await gateway<{ values?: string[][] }>(
    `/spreadsheets/${spreadsheetId}/values/${tab}!${range}?valueRenderOption=FORMATTED_VALUE`,
  );
  return (data.values ?? []).map((r) => r.map((c) => (c === null ? "" : String(c))));
}

export async function updateRange(tabKey: string, a1: string, values: (string | number)[][]) {
  const { spreadsheetId, tab } = resolveTab(tabKey);
  return gateway(
    `/spreadsheets/${spreadsheetId}/values/${tab}!${a1}?valueInputOption=USER_ENTERED`,
    { method: "PUT", body: JSON.stringify({ values }) },
  );
}

export async function appendRow(tabKey: string, values: (string | number)[]) {
  const { spreadsheetId, tab } = resolveTab(tabKey);
  return gateway(
    `/spreadsheets/${spreadsheetId}/values/${tab}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: JSON.stringify({ values: [values] }) },
  );
}

export async function getSheetIdByTitle(tabKey: string): Promise<number> {
  const { spreadsheetId, tab } = resolveTab(tabKey);
  const meta = await gateway<{
    sheets: { properties: { sheetId: number; title: string } }[];
  }>(`/spreadsheets/${spreadsheetId}?fields=sheets.properties`);
  const found = meta.sheets.find((s) => s.properties.title === tab);
  if (!found) throw new Error(`Sheet tab "${tab}" not found`);
  return found.properties.sheetId;
}

export async function insertColumn(tabKey: string, atIndex0: number) {
  const { spreadsheetId } = resolveTab(tabKey);
  const sheetId = await getSheetIdByTitle(tabKey);
  return gateway(`/spreadsheets/${spreadsheetId}:batchUpdate`, {
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
