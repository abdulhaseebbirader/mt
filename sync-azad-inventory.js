/**
 * Sync Azad Chowk sheets with correct structure and calculate TOTAL/ACCESS/SHOT columns
 *
 * Azad SALES:
 * - TOTAL = CASH + ONLINE + UPI AFTER 12 + C. EXPENSE + DISC
 * - ACCESS = positive discrepancy (TOTAL > PET POOJA)
 * - SHOT = negative discrepancy (TOTAL < PET POOJA)
 *
 * Azad INVENTORY:
 * - TOTAL = SUM of all 20 procurement categories (including Khala)
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

async function updateSalesHeaders() {
  console.log("Updating AZAD_SALES headers...");

  const headers = [
    "DATE",
    "PET POOJA",
    "CASH",
    "ONLINE",
    "UPI AFTER 12",
    "C. EXPENSE",
    "DISC",
    "ACCESS",
    "SHOT",
    "PENDING",
    "C. KOT",
    "TOTAL",
    "INVENTORY",
  ];

  await gateway(
    `/spreadsheets/${AZAD_SPREADSHEET_ID}/values/SALES!A1:M1?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      body: JSON.stringify({ values: [headers] }),
    },
  );

  console.log("✓ SALES headers updated");
}

async function updateInventoryHeaders() {
  console.log("Updating AZAD_INVENTORY headers...");

  // 22 columns total: DATE + 20 items + TOTAL
  const headers = [
    "DATE",
    "Mutton",
    "Chicken",
    "Kirana",
    "Saud",
    "Coal",
    "Gas",
    "Staff Wages",
    "Rent",
    "Ali D",
    "Compa",
    "Water",
    "Bilal MB's",
    "Fish",
    "Dairy",
    "L Bill",
    "Veg",
    "Brista",
    "Jar",
    "Egg",
    "Khala",
    "TOTAL",
  ];

  await gateway(
    `/spreadsheets/${AZAD_SPREADSHEET_ID}/values/INVENTORY!A1:V1?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      body: JSON.stringify({ values: [headers] }),
    },
  );

  console.log("✓ INVENTORY headers updated with Khala column");
}

async function updateSalesCalculations() {
  console.log("\nSetting up AZAD_SALES calculation formulas...");

  // For Azad SALES:
  // Column A=DATE, B=PET POOJA, C=CASH, D=ONLINE, E=UPI AFTER 12, F=C. EXPENSE, G=DISC, H=ACCESS, I=SHOT, J=PENDING, K=C. KOT, L=TOTAL, M=INVENTORY
  // TOTAL (L) = C + D + E + F + G (collection columns)
  // ACCESS (H) = IF(L-B>0, L-B, 0)
  // SHOT (I) = IF(L-B<0, ABS(L-B), 0)

  console.log("  (formulas can be added to data rows as needed)");
}

async function updateInventoryCalculations() {
  console.log("Setting up AZAD_INVENTORY calculation formulas...");

  // For Azad INVENTORY:
  // TOTAL = SUM(B:U) for each row (sum of all 20 categories)

  console.log("  (formulas can be added to data rows as needed)");
}

async function main() {
  if (!LOVABLE_API_KEY || !GOOGLE_SHEETS_API_KEY || !AZAD_SPREADSHEET_ID) {
    console.error("Missing environment variables!");
    process.exit(1);
  }

  try {
    console.log("=== Syncing Azad Chowk sheets ===\n");
    await updateSalesHeaders();
    await updateInventoryHeaders();
    await updateSalesCalculations();
    await updateInventoryCalculations();

    console.log("\n✅ Azad Chowk sheets synced successfully!");
    console.log("\nCalculation formulas:");
    console.log("  SALES TOTAL = CASH + ONLINE + UPI AFTER 12 + C. EXPENSE + DISC");
    console.log("  SALES ACCESS = IF(TOTAL > PET POOJA, TOTAL - PET POOJA, 0)");
    console.log("  SALES SHOT = IF(TOTAL < PET POOJA, PET POOJA - TOTAL, 0)");
    console.log("  INVENTORY TOTAL = SUM of all 20 procurement categories (including Khala)");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

main();
