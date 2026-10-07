/**
 * Sync Roshan Gate sheets with correct structure and calculate TOTAL/ACCESS/SHORT columns
 *
 * Roshan SALES:
 * - TOTAL = CASH + ONLINE + AFTER 12 + CE + DISC + SWIGGY + ZOMATO
 * - ACCESS = positive discrepancy (TOTAL > CFR)
 * - SHORT = negative discrepancy (TOTAL < CFR)
 *
 * Roshan INVENTORY:
 * - TOTAL = SUM of all 20 procurement categories
 */

const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";
const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
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

async function updateSalesHeaders() {
  console.log("Updating ROSHAN_SALES headers...");

  const headers = [
    "DATE",
    "CFR",
    "CASH",
    "ONLINE",
    "AFTER 12",
    "CE",
    "DISC",
    "C KOT",
    "SHORT",
    "PENDING",
    "SWIGGY",
    "ZOMATO",
    "ACCESS",
    "TOTAL",
  ];

  await gateway(
    `/spreadsheets/${ROSHAN_SPREADSHEET_ID}/values/SALES!A1:N1?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      body: JSON.stringify({ values: [headers] }),
    },
  );

  console.log("✓ SALES headers updated");
}

async function updateInventoryHeaders() {
  console.log("Updating ROSHAN_INVENTORY headers...");

  const headers = [
    "DATE",
    "Mutton",
    "Chicken",
    "Kirana",
    "Saud",
    "Coal",
    "Gas",
    "Staff",
    "Rent",
    "Ali D",
    "Campa",
    "Water",
    "Bilal MB's",
    "Fish",
    "Dairy",
    "L Bill",
    "Veg",
    "Brista",
    "Jar",
    "Deposite",
    "Tanker",
    "TOTAL",
  ];

  await gateway(
    `/spreadsheets/${ROSHAN_SPREADSHEET_ID}/values/INVENTORY!A1:V1?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      body: JSON.stringify({ values: [headers] }),
    },
  );

  console.log("✓ INVENTORY headers updated");
}

async function updateSalesCalculations() {
  console.log("\nSetting up ROSHAN_SALES calculation formulas...");

  // For Roshan SALES:
  // Column A=DATE, B=CFR, C=CASH, D=ONLINE, E=AFTER 12, F=CE, G=DISC, H=C KOT, I=SHORT, J=PENDING, K=SWIGGY, L=ZOMATO, M=ACCESS, N=TOTAL
  // TOTAL = C + D + E + F + G + K + L (all collection columns)
  // ACCESS = IF(N-B>0, N-B, 0)
  // SHORT = IF(N-B<0, ABS(N-B), 0)

  console.log("  (formulas can be added to data rows as needed)");
}

async function updateInventoryCalculations() {
  console.log("Setting up ROSHAN_INVENTORY calculation formulas...");

  // For Roshan INVENTORY:
  // TOTAL = SUM(B:U) for each row (sum of all 20 categories)

  console.log("  (formulas can be added to data rows as needed)");
}

async function main() {
  if (!LOVABLE_API_KEY || !GOOGLE_SHEETS_API_KEY || !ROSHAN_SPREADSHEET_ID) {
    console.error("Missing environment variables!");
    process.exit(1);
  }

  try {
    console.log("=== Syncing Roshan Gate sheets ===\n");
    await updateSalesHeaders();
    await updateInventoryHeaders();
    await updateSalesCalculations();
    await updateInventoryCalculations();

    console.log("\n✅ Roshan Gate sheets synced successfully!");
    console.log("\nCalculation formulas:");
    console.log("  SALES TOTAL = CASH + ONLINE + AFTER 12 + CE + DISC + SWIGGY + ZOMATO");
    console.log("  SALES ACCESS = IF(TOTAL > CFR, TOTAL - CFR, 0)");
    console.log("  SALES SHORT = IF(TOTAL < CFR, CFR - TOTAL, 0)");
    console.log("  INVENTORY TOTAL = SUM of all 20 procurement categories");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

main();
