/**
 * Sync Azad Chowk inventory sheet with Khala column
 */

const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";
const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const AZAD_SPREADSHEET_ID = process.env.AZAD_SPREADSHEET_ID;

async function gateway(path, init = {}) {
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Request failed [${res.status}]: ${body}`);
  }
  return await res.json();
}

async function updateInventoryHeaders() {
  console.log("Updating AZAD_INVENTORY headers...");
  
  // 22 columns total: DATE + 20 items + TOTAL
  const headers = ["DATE", "Mutton", "Chicken", "Kirana", "Saud", "Coal", "Gas", "Staff Wages", "Rent", "Ali D", "Compa", "Water", "Bilal MB's", "Fish", "Dairy", "L Bill", "Veg", "Brista", "Jar", "Egg", "Khala", "TOTAL"];
  
  // Tab name is just "INVENTORY" in the Azad spreadsheet
  await gateway(`/spreadsheets/${AZAD_SPREADSHEET_ID}/values/INVENTORY!A1:V1?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    body: JSON.stringify({ values: [headers] }),
  });
  
  console.log("✓ AZAD_INVENTORY headers updated with Khala column");
}

async function main() {
  if (!LOVABLE_API_KEY || !GOOGLE_SHEETS_API_KEY || !AZAD_SPREADSHEET_ID) {
    console.error("Missing environment variables!");
    process.exit(1);
  }
  
  try {
    console.log("Syncing Azad Chowk inventory sheet...\n");
    await updateInventoryHeaders();
    console.log("\n✅ Azad Chowk inventory updated successfully!");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

main();
