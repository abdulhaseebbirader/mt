/**
 * Clear all test data from SALES and INVENTORY sheets
 * Keeps headers intact, removes only data rows
 */

const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";
const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const AZAD_SPREADSHEET_ID = process.env.AZAD_SPREADSHEET_ID;
const ROSHAN_SPREADSHEET_ID = process.env.ROSHAN_SPREADSHEET_ID;

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

async function clearSheetData(spreadsheetId, tabName, sheetDescription) {
  console.log(`\nClearing ${sheetDescription}...`);
  
  // Get current data to see how many rows to clear
  const response = await gateway(`/spreadsheets/${spreadsheetId}/values/${tabName}!A:Z`, {
    method: "GET",
  });
  
  const rows = response.values || [];
  console.log(`  Current rows: ${rows.length}`);
  
  if (rows.length > 1) {
    // Keep only header (row 1), clear everything else (rows 2+)
    // Clear from row 2 onwards
    await gateway(`/spreadsheets/${spreadsheetId}/values/${tabName}!A2:Z1000?valueInputOption=USER_ENTERED`, {
      method: "PUT",
      body: JSON.stringify({ values: [] }),
    });
    
    console.log(`  ✓ Cleared all data rows (kept headers)`);
  } else {
    console.log(`  ✓ No data to clear`);
  }
}

async function main() {
  if (!LOVABLE_API_KEY || !GOOGLE_SHEETS_API_KEY || !AZAD_SPREADSHEET_ID || !ROSHAN_SPREADSHEET_ID) {
    console.error("Missing environment variables!");
    process.exit(1);
  }
  
  try {
    console.log("=== CLEARING ALL TEST DATA ===\n");
    
    console.log("AZAD CHOWK:");
    await clearSheetData(AZAD_SPREADSHEET_ID, "SALES", "AZAD_SALES");
    await clearSheetData(AZAD_SPREADSHEET_ID, "INVENTORY", "AZAD_INVENTORY");
    
    console.log("\n\nROSHAN GATE:");
    await clearSheetData(ROSHAN_SPREADSHEET_ID, "SALES", "ROSHAN_SALES");
    await clearSheetData(ROSHAN_SPREADSHEET_ID, "INVENTORY", "ROSHAN_INVENTORY");
    
    console.log("\n\n✅ All test data cleared successfully!");
    console.log("   Headers remain intact");
    console.log("   Ready for fresh data entry");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

main();
