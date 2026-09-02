/**
 * Update the TOTAL rows (cycle-end summary rows) with proper SUM formulas
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

async function updateSalesTotalRow() {
  console.log("Updating SALES TOTAL row formulas (row 6)...\n");
  
  // For TOTAL row, each collection column should sum all daily entries in the cycle
  // Row 6 is our TOTAL row
  // We'll sum rows 2-5 (the daily entries before TOTAL row)
  
  const columns = [
    { letter: "C", name: "CASH" },
    { letter: "D", name: "ONLINE" },
    { letter: "E", name: "AFTER 12" },
    { letter: "F", name: "EXPENSE" },
    { letter: "G", name: "DISC" },
    { letter: "N", name: "TOTAL" },
  ];
  
  for (const col of columns) {
    const formula = `=SUM(${col.letter}2:${col.letter}5)`;
    
    await gateway(`/spreadsheets/${AZAD_SPREADSHEET_ID}/values/SALES!${col.letter}6?valueInputOption=USER_ENTERED`, {
      method: "PUT",
      body: JSON.stringify({ values: [[formula]] }),
    });
    
    console.log(`  ✓ Column ${col.letter} (${col.name}): =SUM(${col.letter}2:${col.letter}5)`);
  }
  
  console.log("\n✓ Updated SALES TOTAL row\n");
}

async function updateInventoryTotalRow() {
  console.log("Updating INVENTORY TOTAL row formulas (row 6)...\n");
  
  // For INVENTORY TOTAL row, sum each category from rows 2-5
  // Columns B-U are the 20 categories, V is TOTAL
  
  const columns = [];
  for (let i = 0; i < 20; i++) {
    columns.push(String.fromCharCode(66 + i)); // B-U
  }
  columns.push("V"); // TOTAL column
  
  for (const col of columns) {
    const formula = `=SUM(${col}2:${col}5)`;
    
    await gateway(`/spreadsheets/${AZAD_SPREADSHEET_ID}/values/INVENTORY!${col}6?valueInputOption=USER_ENTERED`, {
      method: "PUT",
      body: JSON.stringify({ values: [[formula]] }),
    });
    
    console.log(`  ✓ Column ${col}: =SUM(${col}2:${col}5)`);
  }
  
  console.log("\n✓ Updated INVENTORY TOTAL row\n");
}

async function main() {
  if (!LOVABLE_API_KEY || !GOOGLE_SHEETS_API_KEY || !AZAD_SPREADSHEET_ID) {
    console.error("Missing environment variables!");
    process.exit(1);
  }
  
  try {
    console.log("=== UPDATING TOTAL ROWS WITH SUM FORMULAS ===\n");
    
    await updateSalesTotalRow();
    await updateInventoryTotalRow();
    
    console.log("✅ All TOTAL rows updated with SUM formulas!");
    console.log("\nFormulas added:");
    console.log("  SALES TOTAL row: Each column sums daily entries (rows 2-5)");
    console.log("  INVENTORY TOTAL row: Each category sums daily entries (rows 2-5)");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

main();
