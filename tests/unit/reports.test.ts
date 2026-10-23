import { describe, it, expect } from "vitest"
import {
  formatDate,
  formatBytes,
  INITIAL_REPORTS,
  CATEGORIES,
  STATUSES,
  PRIORITIES,
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  type Category,
  type Priority,
  type ReportStatus,
} from "@/lib/reports"

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
describe("formatDate", () => {
  it("formats a valid ISO string without throwing", () => {
    const result = formatDate("2026-10-20T09:15:00.000Z")
    expect(result).toBeTruthy()
    expect(result).not.toBe("Invalid Date")
    expect(result).not.toBe("Unknown date")
  })

  it("returns 'Unknown date' for an empty string", () => {
    expect(formatDate("")).toBe("Unknown date")
  })

  it("returns 'Unknown date' for a garbage string", () => {
    expect(formatDate("not-a-date")).toBe("Unknown date")
  })

  it("returns 'Unknown date' for NaN date input", () => {
    expect(formatDate("NaN")).toBe("Unknown date")
  })

  it("formats seed report dates correctly (smoke test)", () => {
    for (const report of INITIAL_REPORTS) {
      const result = formatDate(report.createdAt)
      expect(result).not.toBe("Unknown date")
      expect(result).not.toBe("Invalid Date")
    }
  })
})

// ---------------------------------------------------------------------------
// formatBytes
// ---------------------------------------------------------------------------
describe("formatBytes", () => {
  it("formats bytes below 1 KB as 'N B'", () => {
    expect(formatBytes(0)).toBe("0 B")
    expect(formatBytes(512)).toBe("512 B")
    expect(formatBytes(1023)).toBe("1023 B")
  })

  it("formats values in KB range", () => {
    expect(formatBytes(1024)).toBe("1.0 KB")
    expect(formatBytes(1536)).toBe("1.5 KB")
    expect(formatBytes(1024 * 1024 - 1)).toMatch(/KB$/)
  })

  it("formats values in MB range", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB")
    expect(formatBytes(10 * 1024 * 1024)).toBe("10.0 MB")
  })

  it("handles the 10 MB upload limit correctly", () => {
    const limit = 10 * 1024 * 1024
    expect(formatBytes(limit)).toBe("10.0 MB")
  })
})

// ---------------------------------------------------------------------------
// INITIAL_REPORTS structural integrity
// ---------------------------------------------------------------------------
describe("INITIAL_REPORTS", () => {
  it("is non-empty", () => {
    expect(INITIAL_REPORTS.length).toBeGreaterThan(0)
  })

  it("every report has required fields with correct types", () => {
    for (const report of INITIAL_REPORTS) {
      expect(typeof report.id).toBe("string")
      expect(report.id.length).toBeGreaterThan(0)
      expect(typeof report.title).toBe("string")
      expect(report.title.length).toBeGreaterThan(0)
      expect(CATEGORIES).toContain(report.category as Category)
      expect(STATUSES).toContain(report.status as ReportStatus)
      expect(PRIORITIES).toContain(report.priority as Priority)
      expect(typeof report.progress).toBe("number")
      expect(report.progress).toBeGreaterThanOrEqual(0)
      expect(report.progress).toBeLessThanOrEqual(100)
      // createdAt must be a parseable ISO string
      expect(formatDate(report.createdAt)).not.toBe("Unknown date")
    }
  })

  it("every report id is unique", () => {
    const ids = INITIAL_REPORTS.map((r) => r.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it("resolved reports have 100% progress", () => {
    const resolved = INITIAL_REPORTS.filter((r) => r.status === "resolved")
    for (const r of resolved) {
      expect(r.progress).toBe(100)
    }
  })
})

// ---------------------------------------------------------------------------
// Label maps completeness
// ---------------------------------------------------------------------------
describe("CATEGORY_LABELS", () => {
  it("has a label for every category", () => {
    for (const cat of CATEGORIES) {
      expect(CATEGORY_LABELS[cat]).toBeTruthy()
    }
  })
})

describe("PRIORITY_LABELS", () => {
  it("has a label for every priority", () => {
    for (const p of PRIORITIES) {
      expect(PRIORITY_LABELS[p]).toBeTruthy()
    }
  })
})
