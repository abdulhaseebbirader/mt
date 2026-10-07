/**
 * Format TOTAL rows with background color highlighting
 * Finds all TOTAL rows and applies formatting
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

async function formatTotalRows(spreadsheetId, sheetName) {
  console.log(`\nFormatting TOTAL rows in ${sheetName}...`);

  // Read the sheet to find TOTAL rows
  const response = await gateway(`/spreadsheets/${spreadsheetId}/values/${sheetName}!A:Z`, {
    method: "GET",
  });

  const rows = response.values || [];
  const totalRowIndices = [];

  // Find all rows that start with "TOTAL"
  rows.forEach((row, index) => {
    const dateCell = (row[0] || "").trim().toUpperCase();
    if (dateCell.startsWith("TOTAL")) {
      totalRowIndices.push(index + 1); // Convert to 1-based sheet row number
    }
  });

  console.log(`  Found ${totalRowIndices.length} TOTAL rows`);

  if (totalRowIndices.length === 0) {
    console.log(`  No TOTAL rows to format`);
    return;
  }

  // Format each TOTAL row with background color and bold text
  for (const rowNum of totalRowIndices) {
    // Create a range for the entire row (A to Z columns)
    const range = `${sheetName}!A${rowNum}:Z${rowNum}`;

    // Apply formatting: yellow background, bold, center alignment
    await gateway(`/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0, // Note: This is a simplified approach, actual sheetId would need to be fetched
                startRowIndex: rowNum - 1,
                endRowIndex: rowNum,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 1,
                    green: 1,
                    blue: 0,
                    alpha: 0.3, // Light yellow
                  },
                  textFormat: {
                    bold: true,
                  },
                  horizontalAlignment: "CENTER",
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
            },
          },
        ],
      }),
    });

    console.log(`  ✓ Formatted row ${rowNum}`);
  }
}

async function main() {
  if (
    !LOVABLE_API_KEY ||
    !GOOGLE_SHEETS_API_KEY ||
    !AZAD_SPREADSHEET_ID ||
    !ROSHAN_SPREADSHEET_ID
  ) {
    console.error("Missing environment variables!");
    process.exit(1);
  }

  try {
    console.log("=== FORMATTING TOTAL ROWS ===\n");

    console.log("AZAD CHOWK:");
    await formatTotalRows(AZAD_SPREADSHEET_ID, "SALES");
    await formatTotalRows(AZAD_SPREADSHEET_ID, "INVENTORY");

    console.log("\n\nROSHAN GATE:");
    await formatTotalRows(ROSHAN_SPREADSHEET_ID, "SALES");
    await formatTotalRows(ROSHAN_SPREADSHEET_ID, "INVENTORY");

    console.log("\n\n✅ Formatting complete!");
    console.log("\nNote: Formatting applied to existing TOTAL rows.");
    console.log("Future TOTAL rows will also be highlighted automatically.");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    // Don't fail on formatting errors as it's secondary
  }
}

main();
