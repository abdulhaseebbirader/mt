// Client-safe domain model: branches, sheet tabs, cycle rules, reconciliation math.

export type BranchId = "azad" | "roshan";
export type ModuleId = "sales" | "inventory";

export const BRANCHES: { id: BranchId; name: string; short: string }[] = [
  { id: "azad", name: "Azad Chowk", short: "Azad" },
  { id: "roshan", name: "Roshan Gate", short: "Roshan" },
];

export const TABS: Record<BranchId, Record<ModuleId, string>> = {
  azad: { sales: "AZAD_SALES", inventory: "AZAD_INVENTORY" },
  roshan: { sales: "ROSHAN_SALES", inventory: "ROSHAN_INVENTORY" },
};

export const SALES_COLUMNS = [
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
] as const;

/** Columns the user types into. The rest are derived. */
export const SALES_INPUTS = [
  "PET POOJA",
  "CASH",
  "ONLINE",
  "UPI AFTER 12",
  "C. EXPENSE",
  "DISC",
  "PENDING",
  "C. KOT",
  "INVENTORY",
] as const;

export const SALES_DERIVED = ["ACCESS", "SHOT", "TOTAL"] as const;

export const ARCHIVE_PREFIX = "ARCHIVED:";

export function isArchived(header: string) {
  return header.startsWith(ARCHIVE_PREFIX);
}

export function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function money(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

/** TOTAL = CASH + ONLINE + UPI AFTER 12 + C. EXPENSE + DISC */
export function reconcile(values: Record<string, number>) {
  const total =
    num(values["CASH"]) +
    num(values["ONLINE"]) +
    num(values["UPI AFTER 12"]) +
    num(values["C. EXPENSE"]) +
    num(values["DISC"]);
  const discrepancy = total - num(values["PET POOJA"]);
  return {
    total,
    discrepancy,
    access: discrepancy > 0 ? discrepancy : 0,
    shot: discrepancy < 0 ? Math.abs(discrepancy) : 0,
  };
}

/* ------------------------------- dates ---------------------------------- */

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** DD/MM/YY */
export function toDDMMYY(d: Date): string {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;
}

/** YYYY-MM-DD for <input type="date"> */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDDMMYY(s: string): Date | null {
  const t = s.trim();
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(t);
  if (m) {
    const [, dd, mm, yy] = m;
    const year = yy!.length === 2 ? 2000 + Number(yy) : Number(yy);
    return new Date(year, Number(mm) - 1, Number(dd));
  }
  // Fallback: Google Sheets may return a date serial number.
  if (/^\d{5}(\.\d+)?$/.test(t)) {
    const ms = Math.round((Number(t) - 25569) * 86400 * 1000);
    const d = new Date(ms);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }
  return null;
}

export function fromISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

export type Cycle = { start: Date; end: Date; label: string; key: string };

/** Accounting cycle runs from the 14th to the 13th of the next month. */
export function cycleFor(d: Date): Cycle {
  const start =
    d.getDate() >= 14
      ? new Date(d.getFullYear(), d.getMonth(), 14)
      : new Date(d.getFullYear(), d.getMonth() - 1, 14);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 13);
  return {
    start,
    end,
    label: `${toDDMMYY(start)} – ${toDDMMYY(end)}`,
    key: `${start.getFullYear()}-${pad(start.getMonth() + 1)}`,
  };
}

export function shiftCycle(c: Cycle, months: number): Cycle {
  return cycleFor(new Date(c.start.getFullYear(), c.start.getMonth() + months, 14));
}

export function inCycle(d: Date, c: Cycle) {
  return d >= c.start && d <= c.end;
}

export function totalRowLabel(c: Cycle) {
  return `TOTAL ${toDDMMYY(c.start)}-${toDDMMYY(c.end)}`;
}

export function isTotalRow(dateCell: string) {
  return dateCell.trim().toUpperCase().startsWith("TOTAL");
}

/* ------------------------------ sheet rows ------------------------------- */

export type SheetData = { headers: string[]; rows: string[][]; rowNumbers: number[] };

export type ParsedRow = {
  /** 1-based sheet row number */
  rowNumber: number;
  date: Date;
  dateText: string;
  values: Record<string, number>;
};

export function parseRows(data: SheetData): ParsedRow[] {
  const out: ParsedRow[] = [];
  data.rows.forEach((row, i) => {
    const dateText = (row[0] ?? "").trim();
    if (!dateText || isTotalRow(dateText)) return;
    const date = fromDDMMYY(dateText);
    if (!date) return;
    const values: Record<string, number> = {};
    data.headers.forEach((h, ci) => {
      if (ci === 0) return;
      values[h] = num(row[ci]);
    });
    out.push({ rowNumber: data.rowNumbers[i]!, date, dateText, values });
  });
  return out;
}
