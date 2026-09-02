/**
 * Update ACCESS and SHOT columns with proper discrepancy calculations
 * 
 * For Azad SALES:
 * ACCESS = positive discrepancy (when TOTAL > PET POOJA)
 * SHOT = negative discrepancy (when TOTAL < PET POOJA)
 * 
 * Formula logic:
 * TOTAL = sum of collection parts (CASH + ONLINE + AFTER 12 + EXPENSE + DISC)
 * DISCREPANCY = TOTAL - PET POOJA (target)
 * ACCESS = IF(DISCREPANCY > 0, DISCREPANCY, 0)
 * SHOT = IF(DISCREPANCY < 0, ABS(DISCREPANCY), 0)
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

async function updateAccessShotFormulas() {
  console.log("Updating ACCESS and SHOT columns with discrepancy formulas...\n");
  
  // For Azad SALES:
  // Column B = PET POOJA (target)
  // Column M = ACCESS
  // Column I = SHOT
  // Column N = TOTAL (already calculated)
  // 
  // DISCREPANCY = N (TOTAL) - B (PET POOJA)
  // ACCESS = IF(DISCREPANCY > 0, DISCREPANCY, 0)
  // SHOT = IF(DISCREPANCY < 0, ABS(DISCREPANCY), 0)
  
  const rowsToUpdate = [2, 3, 4, 5, 7, 8]; // Rows with daily data
  
  for (const row of rowsToUpdate) {
    // ACCESS formula: =IF(N{row}-B{row}>0, N{row}-B{row}, 0)
    const accessFormula = `=IF(N${row}-B${row}>0, N${row}-B${row}, 0)`;
    
    await gateway(`/spreadsheets/${AZAD_SPREADSHEET_ID}/values/SALES!M${row}?valueInputOption=USER_ENTERED`, {
      method: "PUT",
      body: JSON.stringify({ values: [[accessFormula]] }),
    });
    
    console.log(`  ✓ Row ${row} ACCESS: =IF(N${row}-B${row}>0, N${row}-B${row}, 0)`);
    
    // SHOT formula: =IF(N{row}-B{row}<0, ABS(N{row}-B{row}), 0)
    const shotFormula = `=IF(N${row}-B${row}<0, ABS(N${row}-B${row}), 0)`;
    
    await gateway(`/spreadsheets/${AZAD_SPREADSHEET_ID}/values/SALES!I${row}?valueInputOption=USER_ENTERED`, {
      method: "PUT",
      body: JSON.stringify({ values: [[shotFormula]] }),
    });
    
    console.log(`  ✓ Row ${row} SHOT: =IF(N${row}-B${row}<0, ABS(N${row}-B${row}), 0)`);
  }
  
  console.log("\n✓ Updated daily rows with ACCESS and SHOT formulas\n");
}

async function updateTotalRowAccessShot() {
  console.log("Updating ACCESS and SHOT in TOTAL row...\n");
  
  // For the TOTAL row (row 6), ACCESS and SHOT should also sum the daily values
  // ACCESS = SUM(M2:M5)
  // SHOT = SUM(I2:I5)
  
  const accessFormula = "=SUM(M2:M5)";
  const shotFormula = "=SUM(I2:I5)";
  
  await gateway(`/spreadsheets/${AZAD_SPREADSHEET_ID}/values/SALES!M6?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    body: JSON.stringify({ values: [[accessFormula]] }),
  });
  
  console.log(`  ✓ TOTAL row ACCESS: =SUM(M2:M5)`);
  
  await gateway(`/spreadsheets/${AZAD_SPREADSHEET_ID}/values/SALES!I6?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    body: JSON.stringify({ values: [[shotFormula]] }),
  });
  
  console.log(`  ✓ TOTAL row SHOT: =SUM(I2:I5)\n`);
}

async function main() {
  if (!LOVABLE_API_KEY || !GOOGLE_SHEETS_API_KEY || !AZAD_SPREADSHEET_ID) {
    console.error("Missing environment variables!");
    process.exit(1);
  }
  
  try {
    console.log("=== UPDATING ACCESS AND SHOT COLUMNS ===\n");
    
    await updateAccessShotFormulas();
    await updateTotalRowAccessShot();
    
    console.log("✅ All ACCESS and SHOT columns updated with formulas!");
    console.log("\nFormulas logic:");
    console.log("  DISCREPANCY = TOTAL - PET POOJA (target)");
    console.log("  ACCESS = IF(DISCREPANCY > 0, DISCREPANCY, 0)  [positive = excess collected]");
    console.log("  SHOT = IF(DISCREPANCY < 0, ABS(DISCREPANCY), 0)  [negative = shortfall]");
    console.log("\nFor each row:");
    console.log("  ACCESS shows how much EXTRA was collected (if positive discrepancy)");
    console.log("  SHOT shows how much was SHORT (if negative discrepancy)");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

main();
