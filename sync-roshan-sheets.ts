/**
 * Sync Roshan Gate sheets with correct horizontal structure
 * Updates column headers to match our schema
 */

const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";
const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY!;
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY!;
const ROSHAN_SPREADSHEET_ID = process.env.ROSHAN_SPREADSHEET_ID!;

async function gateway<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Error [${res.status}]: ${body}`);
    throw new Error(`Request failed [${res.status}]`);
  }
  return (await res.json()) as T;
}

async function updateSalesHeaders() {
  console.log("Updating ROSHAN_SALES headers...");
  
  const headers = ["DATE", "CFR", "CASH", "ONLINE", "AFTER 12", "CE", "DISC", "C KOT", "SHORT", "PENDING", "SWIGGY", "ZOMATO", "ACCESS", "TOTAL"];
  
  await gateway(`/spreadsheets/${ROSHAN_SPREADSHEET_ID}/values/SALES!A1:N1?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    body: JSON.stringify({ values: [headers] }),
  });
  
  console.log("✓ SALES headers updated");
}

async function updateInventoryHeaders() {
  console.log("Updating ROSHAN_INVENTORY headers...");
  
  const headers = ["DATE", "Mutton", "Chicken", "Kirana", "Saud", "Coal", "Gas", "Staff", "Rent", "Ali D", "Campa", "Water", "Bilal MB's", "Fish", "Dairy", "L Bill", "Veg", "Brista", "Jar", "Deposite", "Tanker", "TOTAL"];
  
  await gateway(`/spreadsheets/${ROSHAN_SPREADSHEET_ID}/values/INVENTORY!A1:V1?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    body: JSON.stringify({ values: [headers] }),
  });
  
  console.log("✓ INVENTORY headers updated");
}

async function main() {
  if (!LOVABLE_API_KEY || !GOOGLE_SHEETS_API_KEY || !ROSHAN_SPREADSHEET_ID) {
    console.error("Missing environment variables!");
    process.exit(1);
  }
  
  try {
    console.log("Syncing Roshan Gate sheets...\n");
    await updateSalesHeaders();
    await updateInventoryHeaders();
    console.log("\n✅ All sheets synced successfully!");
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

main();
