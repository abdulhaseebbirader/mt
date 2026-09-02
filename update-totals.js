/**
 * Update TOTAL columns in SALES and INVENTORY sheets with proper calculations
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

async function updateSalesFormulas() {
  console.log("Updating SALES sheet TOTAL column with formulas...\n");
  
  // For each date row, update TOTAL column with formula
  // SALES columns: A(DATE) B(PET POOJA) C(CASH) D(ONLINE) E(AFTER 12) F(EXPENSE) G(DISC) ... N(TOTAL)
  // TOTAL = C + D + E + F + G
  
  const rowsToUpdate = [
    { row: 2, date: "10/09/26" },
    { row: 3, date: "11/09/26" },
    { row: 4, date: "12/09/26" },
    { row: 5, date: "13/09/26" },
    { row: 7, date: "14/09/26" },
    { row: 8, date: "15/09/26" },
  ];
  
  for (const item of rowsToUpdate) {
    const formula = `=C${item.row}+D${item.row}+E${item.row}+F${item.row}+G${item.row}`;
    
    await gateway(`/spreadsheets/${AZAD_SPREADSHEET_ID}/values/SALES!N${item.row}?valueInputOption=USER_ENTERED`, {
      method: "PUT",
      body: JSON.stringify({ values: [[formula]] }),
    });
    
    console.log(`  ✓ Row ${item.row} (${item.date}): Added TOTAL formula`);
  }
  
  console.log(`\n✓ Updated ${rowsToUpdate.length} SALES rows with TOTAL formulas\n`);
}

async function updateInventoryFormulas() {
  console.log("Updating INVENTORY sheet TOTAL column with formulas...\n");
  
  // For inventory: TOTAL = SUM of all 20 categories
  // Columns: A(DATE) B(Mutton) ... U(Khala) V(TOTAL)
  // TOTAL = SUM(B:U) for each row
  
  const rowsToUpdate = [
    { row: 2, date: "10/09/26" },
    { row: 3, date: "11/09/26" },
    { row: 4, date: "12/09/26" },
    { row: 5, date: "13/09/26" },
    { row: 7, date: "14/09/26" },
    { row: 8, date: "15/09/26" },
  ];
  
  for (const item of rowsToUpdate) {
    const formula = `=SUM(B${item.row}:U${item.row})`;
    
    await gateway(`/spreadsheets/${AZAD_SPREADSHEET_ID}/values/INVENTORY!V${item.row}?valueInputOption=USER_ENTERED`, {
      method: "PUT",
      body: JSON.stringify({ values: [[formula]] }),
    });
    
    console.log(`  ✓ Row ${item.row} (${item.date}): Added TOTAL formula`);
  }
  
  console.log(`\n✓ Updated ${rowsToUpdate.length} INVENTORY rows with TOTAL formulas\n`);
}

async function main() {
  if (!LOVABLE_API_KEY || !GOOGLE_SHEETS_API_KEY || !AZAD_SPREADSHEET_ID) {
    console.error("Missing environment variables!");
    process.exit(1);
  }
  
  try {
    console.log("=== UPDATING TOTAL COLUMNS WITH FORMULAS ===\n");
    
    await updateSalesFormulas();
    await updateInventoryFormulas();
    
    console.log("✅ All TOTAL columns updated with formulas!");
    console.log("\nFormulas added:");
    console.log("  SALES: TOTAL = CASH + ONLINE + AFTER 12 + EXPENSE + DISC");
    console.log("  INVENTORY: TOTAL = SUM(Mutton through Khala)");
    console.log("\nGoogle Sheets will auto-calculate these formulas.");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

main();
