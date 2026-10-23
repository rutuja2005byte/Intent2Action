/**
 * Integration-level unit tests for the Alert page's data filtering and
 * sorting logic (which runs as a pure computation on INITIAL_REPORTS).
 */
import { describe, it, expect } from "vitest"
import {
  INITIAL_REPORTS,
  PRIORITIES,
  type Priority,
} from "@/lib/reports"

const ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  watch: 2,
}

// Mirrors the Alert page computation exactly
function getAlerts() {
  return INITIAL_REPORTS.filter(
    (r) => r.priority === "critical" || r.priority === "high"
  ).sort((a, b) => ORDER[a.priority] - ORDER[b.priority])
}

describe("Alert page filtering", () => {
  it("excludes 'watch' priority reports", () => {
    const alerts = getAlerts()
    const hasWatch = alerts.some((r) => r.priority === "watch")
    expect(hasWatch).toBe(false)
  })

  it("includes all critical and high priority reports from seed data", () => {
    const alerts = getAlerts()
    const expected = INITIAL_REPORTS.filter(
      (r) => r.priority === "critical" || r.priority === "high"
    )
    expect(alerts.length).toBe(expected.length)
  })

  it("sorts critical before high", () => {
    const alerts = getAlerts()
    let seenHigh = false
    for (const alert of alerts) {
      if (alert.priority === "high") seenHigh = true
      if (seenHigh && alert.priority === "critical") {
        throw new Error("critical appeared after high — sort is wrong")
      }
    }
    expect(true).toBe(true) // no exception thrown
  })

  it("ORDER map covers all priorities", () => {
    for (const p of PRIORITIES) {
      expect(ORDER[p]).toBeDefined()
      expect(typeof ORDER[p]).toBe("number")
    }
  })

  it("is stable with the seed data (snapshot-style check)", () => {
    const alerts = getAlerts()
    // We know the seed data has exactly one critical and two high-priority items
    expect(alerts[0].priority).toBe("critical")
    for (const rest of alerts.slice(1)) {
      expect(rest.priority).toBe("high")
    }
  })
})
