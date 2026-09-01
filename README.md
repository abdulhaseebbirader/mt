# Branch Books Hub

Build a complete, mobile-first Progressive Web App (PWA) called "Restaurant Multi-Branch Reconcile & Inventory Hub" designed specifically for zero-config deployment on Vercel.

The application acts as a single, centralized frontend dashboard for a restaurant owner to log and manage daily sales reconciliation and raw material/inventory procurement across multiple branches directly into Google Sheets without opening the spreadsheets manually.

---

### 1. Multi-Branch & Multi-Sheet Architecture

The app must manage two separate physical branches, with each branch handling two independent operational sheets (or tabs within a Google Spreadsheet):

1. Branch 1: Azad Chowk

   - Sheet A: Daily Sales & Closing Reconciliation

   - Sheet B: Raw Material / Inventory Procurement Register

2. Branch 2: Roshan Gate

   - Sheet A: Daily Sales & Closing Reconciliation

   - Sheet B: Raw Material / Inventory Procurement Register

Top Navigation: Persistent branch switcher (`Azad Chowk` | `Roshan Gate`) and module switcher (`Daily Sales Closing` | `Inventory / Procurement`).

---

### 2. Module 1: Daily Sales & Closing Reconciliation

* Monthly Cycle Rule: Accounting cycles run strictly from the 14th of each month to the 13th of the subsequent month (e.g., 14 April to 13 May). When the cycle ends on the 13th night or 14th morning, auto-insert a summary total row summing all numeric columns before creating new date rows for the next cycle.

* Standard Schema:

  - Date (DD/MM/YY)

  - PET POOJA (POS sales target figure)

  - CASH (Cash in register)

  - ONLINE (UPI, card payments, Swiggy/Zomato)

  - UPI AFTER 12 (Midnight cutoff collections)

  - C. EXPENSE (Petty counter expenses)

  - DISC (Discounts given)

  - ACCESS (Auto-calculated excess cash)

  - SHOT (Auto-calculated short cash)

  - PENDING (Credit/unpaid tabs)

  - C. KOT (Cancelled/complimentary KOT value)

  - TOTAL (Calculated actual collection)

  - INVENTORY (Daily stock/procurement link)

* Reconciliation Arithmetic:

  - TOTAL = CASH + ONLINE + UPI_AFTER_12 + C_EXPENSE + DISC

  - Discrepancy = TOTAL - PET_POOJA

  - If Discrepancy > 0 -> ACCESS = Discrepancy, SHOT = 0

  - If Discrepancy < 0 -> SHOT = abs(Discrepancy), ACCESS = 0

  - If Discrepancy == 0 -> ACCESS = 0, SHOT = 0

---

### 3. Module 2: Daily Raw Material & Expense Register (Inventory)

* Schema Structure (Based on Azad Chowk Register):

  - Date (Col A)

  - Dynamic Expense Columns: Mutton, Chicken, Kirana (Groceries), Saud, Coal, Gas, Staff Wages, Rent, Ali D, Compa, Water, Bilal MB's, Fish, Dairy, L Bill (Electricity Bill), Veg, Brista (Fried Onions), Jar, Egg, etc.

* Dynamic Column Management:

  - The UI must dynamically read and render active column headers from the sheet.

  - Settings Modal: Allow the owner to Add a new category/column, Rename an existing column header, or Delete/Archive a column without corrupting historical row records.

* Fast Data Entry Grid:

  - Mobile-optimized numerical keypad / fast-input form where user selects Date (defaults to today) and logs amounts across active procurement categories.

  - Auto-calculate total daily procurement expense row-wise.

  - Follow the same 14th-to-13th monthly cycle structure with automated period totals.

---

### 4. Core Features & UX

* Unified Dashboard:

  - Quick summary cards for the selected branch (Current Cycle Revenue vs. Current Cycle Inventory Cost).

  - Net operational cash flow indicator (`Cycle Revenue - Cycle Procurement/Expenses`).

* History & Inline Edit:

  - Searchable, filterable table view showing entries for the current active cycle.

  - Click any past date entry to edit values or correct typos, syncing changes directly to the respective Google Sheet cell.

* Offline Resilience:

  - Local caching via IndexedDB/localStorage so entries can be logged during internet dropouts and auto-synced with Google Sheets once reconnected.

* Security & State:

  - Lightweight single-admin access (clean state management, optional local PIN lock for counter tablet security).

---

### 5. Tech Stack & Vercel Deployment Configuration

* Framework: Next.js (App Router) with TypeScript, Tailwind CSS, Lucide React icons, and standard mobile touch UI components.

* Backend & Google Sheets Integration:

  - Use Next.js Server Actions / API routes (`/api/sync-sheet`) with the official `googleapis` package (Google Service Account) or a secure Google Apps Script Web App endpoint.

  - Never expose API credentials or service account private keys to the client browser.

* Vercel Optimization:

  - Include a production-ready `vercel.json` with proper cache-control headers for Service Workers, PWA manifest, and static assets.

  - Ensure `npm run build` runs with zero TypeScript/ESLint warnings or errors.

  - Ensure client-side SPA routing works properly on full page reloads.

* PWA Configuration:

  - Standalone web app manifest (`manifest.json`), service worker for offline asset caching, and responsive high-res icons for iOS/Android home screens.

* Output Deliverables:

  - Full source code structure.

  - A clean `.env.example` file specifying all environment variables (e.g., `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`).

  - Step-by-step setup guide for configuring the Google Service Account and deploying the repository directly to Vercel in one click.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://daily-dish-sheets.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5043fab5-f5e7-4ce8-9ce6-6791202434c7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
