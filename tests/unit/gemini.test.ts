import { describe, it, expect } from "vitest"
import {
  heuristicIntentToAction,
  convertIntentToAction,
  ActionResponseSchema,
  ACTION_CATEGORIES,
  ACTION_PRIORITIES,
} from "@/lib/gemini"

describe("heuristicIntentToAction", () => {
  it("classifies electrical live wire hazard as critical priority with safety advice", () => {
    const result = heuristicIntentToAction({
      notes: "A high-voltage live wire snapped near the bus stop, sparking near water puddles.",
    })

    expect(result.category).toBe("lighting")
    expect(result.priority).toBe("critical")
    expect(result.urgencyScore).toBeGreaterThanOrEqual(90)
    expect(result.lifeSavingAction).toContain("electrical grid")
    expect(result.safetyAdvice).toContain("30 feet")
    expect(result.immediateSteps.length).toBeGreaterThanOrEqual(3)
  })

  it("classifies open manhole and road cave-in as critical road hazard", () => {
    const result = heuristicIntentToAction({
      notes: "Massive road cave-in with open manhole causing accidents near the main crossing.",
    })

    expect(result.category).toBe("roads")
    expect(result.priority).toBe("critical")
    expect(result.urgencyScore).toBeGreaterThanOrEqual(90)
    expect(result.targetDepartment).toContain("Public Works")
  })

  it("classifies standard pothole as high priority road report", () => {
    const result = heuristicIntentToAction({
      notes: "Large potholes causing traffic slowdown on Jangli Maharaj Road.",
    })

    expect(result.category).toBe("roads")
    expect(result.priority).toBe("high")
    expect(result.urgencyScore).toBe(75)
  })

  it("classifies water contamination as water category with drinking safety advice", () => {
    const result = heuristicIntentToAction({
      notes: "Discolored contaminated drinking water coming out of municipal taps with bad odor.",
    })

    expect(result.category).toBe("water")
    expect(result.priority).toBe("critical")
    expect(result.safetyAdvice).toContain("boil")
  })

  it("classifies overflowing garbage as sanitation watch priority", () => {
    const result = heuristicIntentToAction({
      notes: "Public garbage bin overflowing at the park entrance attracting stray animals.",
    })

    expect(result.category).toBe("sanitation")
    expect(result.priority).toBe("watch")
    expect(result.urgencyScore).toBeLessThan(70)
  })

  it("produces valid schema for any generic input", () => {
    const result = heuristicIntentToAction({
      notes: "Strange noise coming from public utility transformer box.",
    })

    expect(ACTION_CATEGORIES).toContain(result.category)
    expect(ACTION_PRIORITIES).toContain(result.priority)
    expect(result.immediateSteps.length).toBeGreaterThan(0)
    expect(result.lifeSavingAction.length).toBeGreaterThan(0)
  })
})

describe("convertIntentToAction", () => {
  it("converts unstructured input into structured verified action (fallback engine)", async () => {
    const action = await convertIntentToAction({
      notes: "Downed live electric wire sparking on the street.",
      fileNames: ["hazard_photo.jpg"],
      fileKinds: ["image"],
    })

    expect(action.id).toMatch(/^act-/)
    expect(action.verified).toBe(true)
    expect(action.engine).toBe("intent2action-engine")
    expect(action.priority).toBe("critical")
    expect(action.processedAt).toBeTruthy()

    // Validate with Zod schema
    const parseResult = ActionResponseSchema.safeParse(action)
    expect(parseResult.success).toBe(true)
  })
})
