import { describe, it, expect, beforeEach } from "vitest";
import {
  AZAD_SALES_SCHEMA,
  ROSHAN_SALES_SCHEMA,
  cycleFor,
  shiftCycle,
  inCycle,
  toDDMMYY,
  fromDDMMYY,
  fromISODate,
  toISODate,
  reconcile,
  parseRows,
  totalRowLabel,
  isTotalRow,
  schemaForHeaders,
  SALES_INPUTS,
  num,
  money,
  BRANCHES,
  TABS,
  INVENTORY_COLUMNS,
  isArchived,
  ARCHIVE_PREFIX,
  type SheetData,
  type Cycle,
} from "../domain";

describe("domain", () => {
  describe("SALES_INPUTS", () => {
    it("should export SALES_INPUTS array", () => {
      expect(SALES_INPUTS).toBeDefined();
      expect(Array.isArray(SALES_INPUTS)).toBe(true);
      expect(SALES_INPUTS.length).toBeGreaterThan(0);
    });

    it("should contain expected input fields", () => {
      expect(SALES_INPUTS).toContain("PET POOJA");
      expect(SALES_INPUTS).toContain("CASH");
      expect(SALES_INPUTS).toContain("ONLINE");
    });
  });

  describe("branches and tabs", () => {
    it("should have two branches", () => {
      expect(BRANCHES).toHaveLength(2);
      expect(BRANCHES.map((b) => b.id)).toEqual(["azad", "roshan"]);
    });

    it("should map branches to tabs", () => {
      expect(TABS.azad).toBeDefined();
      expect(TABS.roshan).toBeDefined();
      expect(TABS.azad.sales).toBe("AZAD_SALES");
      expect(TABS.azad.inventory).toBe("AZAD_INVENTORY");
    });

    it("should have inventory columns for each branch", () => {
      expect(INVENTORY_COLUMNS.azad).toBeDefined();
      expect(INVENTORY_COLUMNS.roshan).toBeDefined();
      expect(INVENTORY_COLUMNS.azad.length).toBeGreaterThan(0);
    });
  });

  describe("date utilities", () => {
    it("should convert dates to DD/MM/YY format", () => {
      const date = new Date(2025, 8, 15); // Sept 15, 2025
      expect(toDDMMYY(date)).toBe("15/09/25");
    });

    it("should parse DD/MM/YY dates", () => {
      const result = fromDDMMYY("15/09/25");
      expect(result).toBeDefined();
      expect(result?.getDate()).toBe(15);
      expect(result?.getMonth()).toBe(8); // 0-indexed
      expect(result?.getFullYear()).toBe(2025);
    });

    it("should handle two-digit and four-digit years in parsing", () => {
      const result2digit = fromDDMMYY("01/01/26");
      const result4digit = fromDDMMYY("01/01/2026");
      expect(result2digit?.getFullYear()).toBe(2026);
      expect(result4digit?.getFullYear()).toBe(2026);
    });

    it("should convert to and from ISO date format", () => {
      const date = new Date(2025, 8, 15);
      const iso = toISODate(date);
      expect(iso).toBe("2025-09-15");
      expect(fromISODate(iso).getDate()).toBe(15);
    });

    it("should parse Google Sheets date serial numbers", () => {
      // Sheets serial 45536 = 2024-09-02
      const result = fromDDMMYY("45536");
      expect(result).toBeDefined();
    });
  });

  describe("cycle calculations", () => {
    it("should correctly identify accounting cycles (14th-13th)", () => {
      // Date on 15th should be in current cycle starting 14th
      const date = new Date(2025, 8, 15); // Sept 15
      const cycle = cycleFor(date);
      expect(cycle.start.getDate()).toBe(14);
      expect(cycle.start.getMonth()).toBe(8);

      // Cycle should end on 13th of next month
      expect(cycle.end.getDate()).toBe(13);
      expect(cycle.end.getMonth()).toBe(9);
    });

    it("should handle dates before the 14th", () => {
      const date = new Date(2025, 8, 10); // Sept 10
      const cycle = cycleFor(date);
      expect(cycle.start.getDate()).toBe(14);
      expect(cycle.start.getMonth()).toBe(7); // Aug
    });

    it("should shift cycles correctly", () => {
      const date = new Date(2025, 8, 15);
      const cycle = cycleFor(date);
      const nextCycle = shiftCycle(cycle, 1);
      expect(nextCycle.start.getMonth()).toBe(9); // Oct
      const prevCycle = shiftCycle(cycle, -1);
      expect(prevCycle.start.getMonth()).toBe(7); // Aug
    });

    it("should check if date is in cycle", () => {
      const date = new Date(2025, 8, 15);
      const cycle = cycleFor(date);
      expect(inCycle(date, cycle)).toBe(true);

      const dateOutside = new Date(2025, 7, 10);
      expect(inCycle(dateOutside, cycle)).toBe(false);
    });

    it("should use calendar months for Roshan", () => {
      const date = new Date(2025, 8, 10); // Sept 10
      const cycle = cycleFor(date, "roshan");
      expect(cycle.start.getDate()).toBe(1);
      expect(cycle.start.getMonth()).toBe(8);
      expect(cycle.end.getDate()).toBe(30); // last day of Sept
      expect(cycle.end.getMonth()).toBe(8);

      const jan31 = cycleFor(new Date(2025, 0, 31), "roshan");
      expect(jan31.end.getDate()).toBe(31);
      const feb = cycleFor(new Date(2025, 1, 5), "roshan");
      expect(feb.end.getDate()).toBe(28);

      const shifted = shiftCycle(cycle, 1, "roshan");
      expect(shifted.start.getDate()).toBe(1);
      expect(shifted.start.getMonth()).toBe(9);
      expect(shifted.end.getDate()).toBe(31);
    });

    it("should generate cycle labels", () => {
      const date = new Date(2025, 8, 15);
      const cycle = cycleFor(date);
      const label = totalRowLabel(cycle);
      expect(label).toContain("TOTAL");
      expect(label).toContain("14/09/25");
      expect(label).toContain("13/10/25");
    });
  });

  describe("reconciliation", () => {
    it("should calculate TOTAL as sum of parts", () => {
      const values = {
        CASH: 1000,
        ONLINE: 500,
        "UPI AFTER 12": 200,
        "C. EXPENSE": 100,
        DISC: 50,
      };
      const result = reconcile(values, AZAD_SALES_SCHEMA);
      expect(result.total).toBe(1850);
    });

    it("should calculate ACCESS when discrepancy is positive", () => {
      const values = {
        "PET POOJA": 1000,
        CASH: 1100,
        ONLINE: 0,
        "UPI AFTER 12": 0,
        "C. EXPENSE": 0,
        DISC: 0,
      };
      const result = reconcile(values, AZAD_SALES_SCHEMA);
      expect(result.discrepancy).toBe(100);
      expect(result.access).toBe(100);
      expect(result.shot).toBe(0);
    });

    it("should calculate SHOT when discrepancy is negative", () => {
      const values = {
        "PET POOJA": 2000,
        CASH: 1000,
        ONLINE: 500,
        "UPI AFTER 12": 0,
        "C. EXPENSE": 0,
        DISC: 0,
      };
      const result = reconcile(values, AZAD_SALES_SCHEMA);
      expect(result.discrepancy).toBe(-500);
      expect(result.shot).toBe(500);
      expect(result.access).toBe(0);
    });

    it("should handle zero discrepancy", () => {
      const values = {
        "PET POOJA": 1500,
        CASH: 1000,
        ONLINE: 500,
        "UPI AFTER 12": 0,
        "C. EXPENSE": 0,
        DISC: 0,
      };
      const result = reconcile(values, AZAD_SALES_SCHEMA);
      expect(result.discrepancy).toBe(0);
      expect(result.access).toBe(0);
      expect(result.shot).toBe(0);
    });

    it("should work with Roshan schema", () => {
      const values = {
        CFR: 2000,
        CASH: 1000,
        ONLINE: 500,
        "AFTER 12": 200,
        CE: 100,
        DISC: 50,
        SWIGGY: 100,
        ZOMATO: 150,
      };
      const result = reconcile(values, ROSHAN_SALES_SCHEMA);
      expect(result.total).toBe(2100);
      expect(result.discrepancy).toBe(100);
      expect(result.access).toBe(100);
    });
  });

  describe("number utilities", () => {
    it("should parse numbers from strings", () => {
      expect(num("1000")).toBe(1000);
      expect(num("1,000")).toBe(1000);
      expect(num("₹1000")).toBe(1000);
      expect(num("100.50")).toBe(100.5);
    });

    it("should handle null and undefined", () => {
      expect(num(null)).toBe(0);
      expect(num(undefined)).toBe(0);
    });

    it("should format numbers as currency", () => {
      expect(money(1000)).toContain("1,000");
      expect(money(1500)).toContain("1,500");
    });
  });

  describe("row parsing", () => {
    it("should parse sheet data correctly", () => {
      const data: SheetData = {
        headers: ["DATE", "PET POOJA", "CASH", "ONLINE", "TOTAL"],
        rows: [
          ["15/09/25", "1000", "800", "200", "1000"],
          ["16/09/25", "1200", "900", "300", "1200"],
        ],
        rowNumbers: [2, 3],
      };

      const parsed = parseRows(data);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].values["CASH"]).toBe(800);
      expect(parsed[0].values["ONLINE"]).toBe(200);
      expect(parsed[0].rowNumber).toBe(2);
    });

    it("should skip total rows", () => {
      const data: SheetData = {
        headers: ["DATE", "PET POOJA", "CASH"],
        rows: [
          ["15/09/25", "1000", "800"],
          ["TOTAL 14/09/25-13/10/25", "10000", "8000"],
        ],
        rowNumbers: [2, 3],
      };

      const parsed = parseRows(data);
      expect(parsed).toHaveLength(1);
    });

    it("should handle invalid date formats", () => {
      const data: SheetData = {
        headers: ["DATE", "AMOUNT"],
        rows: [
          ["invalid", "100"],
          ["15/09/25", "200"],
        ],
        rowNumbers: [2, 3],
      };

      const parsed = parseRows(data);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].dateText).toBe("15/09/25");
    });
  });

  describe("schema detection", () => {
    it("should detect schema by headers", () => {
      const azadHeaders = [
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
      const schema = schemaForHeaders(azadHeaders);
      expect(schema).toEqual(AZAD_SALES_SCHEMA);
    });

    it("should detect Roshan schema", () => {
      const roshanHeaders = ["DATE", "CFR", "CASH", "ONLINE", "AFTER 12", "CE", "DISC"];
      const schema = schemaForHeaders(roshanHeaders);
      expect(schema).toEqual(ROSHAN_SALES_SCHEMA);
    });

    it("should return null for unknown schema", () => {
      const unknownHeaders = ["DATE", "UNKNOWN1", "UNKNOWN2"];
      const schema = schemaForHeaders(unknownHeaders);
      expect(schema).toBeNull();
    });
  });

  describe("total row detection", () => {
    it("should identify total rows", () => {
      expect(isTotalRow("TOTAL 14/09/25-13/10/25")).toBe(true);
      expect(isTotalRow("  TOTAL  ")).toBe(true);
      expect(isTotalRow("15/09/25")).toBe(false);
    });
  });

  describe("archive handling", () => {
    it("should detect archived columns", () => {
      expect(isArchived("ARCHIVED:Mutton")).toBe(true);
      expect(isArchived("Mutton")).toBe(false);
      expect(isArchived("ARCHIVED:OLD_EXPENSE")).toBe(true);
    });

    it("should have archive prefix", () => {
      expect(ARCHIVE_PREFIX).toBe("ARCHIVED:");
    });
  });
});
