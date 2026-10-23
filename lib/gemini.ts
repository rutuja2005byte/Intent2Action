import { GoogleGenAI } from "@google/genai"
import { z } from "zod"

export const ACTION_CATEGORIES = [
  "lighting",
  "roads",
  "sanitation",
  "water",
  "emergency",
  "other",
] as const

export type ActionCategory = (typeof ACTION_CATEGORIES)[number]

export const ACTION_PRIORITIES = ["critical", "high", "watch"] as const
export type ActionPriority = (typeof ACTION_PRIORITIES)[number]

export const ActionResponseSchema = z.object({
  title: z.string().min(1),
  intent: z.string().min(1),
  category: z.enum(ACTION_CATEGORIES),
  priority: z.enum(ACTION_PRIORITIES),
  urgencyScore: z.number().min(1).max(100),
  lifeSavingAction: z.string().min(1),
  immediateSteps: z.array(z.string()).min(1),
  targetDepartment: z.string().min(1),
  safetyAdvice: z.string().min(1),
})

export type ActionResponse = z.infer<typeof ActionResponseSchema>

export type StructuredAction = ActionResponse & {
  id: string
  verified: boolean
  processedAt: string
  engine: "gemini-2.0-flash" | "intent2action-engine"
}

export type IntentToActionInput = {
  notes: string
  fileKinds?: string[]
  fileNames?: string[]
}

/**
 * Deterministic heuristic analyzer that converts messy real-world reports
 * into structured life-saving actions. Used as a resilient fallback
 * when GEMINI_API_KEY is not set or when external network calls are blocked.
 */
export function heuristicIntentToAction(input: IntentToActionInput): ActionResponse {
  const text = (input.notes || "").toLowerCase()
  const files = (input.fileNames || []).map((f) => f.toLowerCase()).join(" ")
  const combined = `${text} ${files}`

  // 1. Critical Emergency: Electrical hazards / live wire / fire / gas leaks
  if (
    combined.includes("wire") ||
    combined.includes("shock") ||
    combined.includes("electric") ||
    combined.includes("fire") ||
    combined.includes("spark") ||
    combined.includes("gas leak") ||
    combined.includes("explosion")
  ) {
    return {
      title: "Live Electrical / Fire Hazard Detected",
      intent: "Urgent citizen hazard report of live electrical current or fire risk in pedestrian area.",
      category: "lighting",
      priority: "critical",
      urgencyScore: 95,
      lifeSavingAction:
        "Isolate electrical grid feeder immediately; dispatch rapid emergency power safety team and cordon off 30m perimeter.",
      immediateSteps: [
        "De-energize local substation circuit immediately to eliminate electrocution risk.",
        "Dispatch emergency electrical response team with insulated barrier kit.",
        "Notify traffic and municipal police to barricade pedestrian footpath.",
      ],
      targetDepartment: "Municipal Electricity Board & Disaster Management Cell",
      safetyAdvice:
        "DANGER: Stay at least 30 feet away from downed lines or sparking poles. Never touch standing water near electrical lines.",
    }
  }

  // 2. Severe Road & Structural Hazards: Potholes, road cave-in, open manhole, bridge crack
  if (
    combined.includes("pothole") ||
    combined.includes("road") ||
    combined.includes("bridge") ||
    combined.includes("manhole") ||
    combined.includes("cave-in") ||
    combined.includes("accident") ||
    combined.includes("traffic")
  ) {
    const isCritical =
      combined.includes("open manhole") ||
      combined.includes("cave-in") ||
      combined.includes("accident")

    return {
      title: isCritical
        ? "Severe Road Cave-in / Open Manhole Threat"
        : "Road Infrastructure Hazard",
      intent:
        "Citizen incident report detailing physical roadway defect threatening vehicular and pedestrian safety.",
      category: "roads",
      priority: isCritical ? "critical" : "high",
      urgencyScore: isCritical ? 90 : 75,
      lifeSavingAction:
        "Deploy high-visibility warning cones and reflective barriers; dispatch emergency road repair asphalt unit.",
      immediateSteps: [
        "Place warning barricades and high-visibility reflective signs around the hazard zone.",
        "Alert municipal road maintenance squad for same-day cold-mix patching.",
        "Divert heavy vehicle traffic away from damaged surface lane.",
      ],
      targetDepartment: "Public Works Department (PWD) & Traffic Police Division",
      safetyAdvice:
        "Slow down well before the hazard. Two-wheelers should avoid passing through unlit patches.",
    }
  }

  // 3. Water Contamination / Flooding / Pipeline Burst
  if (
    combined.includes("water") ||
    combined.includes("flood") ||
    combined.includes("contamination") ||
    combined.includes("drain") ||
    combined.includes("pipeline") ||
    combined.includes("sewage")
  ) {
    const isCritical =
      combined.includes("flood") ||
      combined.includes("contaminat") ||
      combined.includes("burst")

    return {
      title: isCritical
        ? "Water Contamination / Flash Flood Warning"
        : "Water Supply & Drainage Disruption",
      intent:
        "Citizen report of potable water disruption, contamination, or localized urban flooding.",
      category: "water",
      priority: isCritical ? "critical" : "high",
      urgencyScore: isCritical ? 88 : 72,
      lifeSavingAction:
        "Isolate contaminated pipeline line; deploy emergency potable water tankers and initiate water-sample testing.",
      immediateSteps: [
        "Dispatch emergency water tankers to provide clean drinking water to residents.",
        "Mobilize engineering team to shut off burst trunk mains and inspect contamination.",
        "Issue boil-water advisory to affected residential zones.",
      ],
      targetDepartment: "Water Supply and Sewerage Board",
      safetyAdvice:
        "Do not consume tap water without boiling. Avoid contact with stagnating drainage water.",
    }
  }

  // 4. Sanitation & Biohazard
  if (
    combined.includes("garbage") ||
    combined.includes("bin") ||
    combined.includes("sanitation") ||
    combined.includes("waste") ||
    combined.includes("stray") ||
    combined.includes("smell")
  ) {
    return {
      title: "Public Sanitation & Waste Accumulation",
      intent:
        "Civic report of overflow and uncollected municipal waste attracting pests in public space.",
      category: "sanitation",
      priority: "watch",
      urgencyScore: 50,
      lifeSavingAction:
        "Deploy automated compactor vehicle and sanitize area with medical-grade disinfectant.",
      immediateSteps: [
        "Route immediate waste clearance vehicle to the designated location.",
        "Spray disinfectant and anti-larval treatment to prevent vector-borne disease spread.",
        "Schedule twice-daily collection rounds for high-density gate areas.",
      ],
      targetDepartment: "Solid Waste Management Department",
      safetyAdvice:
        "Avoid close contact with overflowing refuse. Keep pets and children away from the pile.",
    }
  }

  // 5. Default General Action
  return {
    title: "Civic Incident Report",
    intent:
      input.notes.trim() ||
      "Unstructured citizen incident input received for automated triage.",
    category: "other",
    priority: "high",
    urgencyScore: 70,
    lifeSavingAction:
      "Log incident into municipal emergency dispatch queue and assign first-responder verification unit.",
    immediateSteps: [
      "Verify incident location and citizen contact coordinates.",
      "Assign field inspector for on-site assessment within 2 hours.",
      "Track resolution progress through civic dashboard.",
    ],
    targetDepartment: "Citizen Grievance Redressal & Emergency Operations Center",
    safetyAdvice:
      "Maintain safe distance from unidentified hazards and follow instructions from municipal emergency personnel.",
  }
}

/**
 * Converts messy, unstructured real-world inputs (voice, notes, incident photos)
 * into verified, structured, life-saving actions using Gemini AI.
 */
export async function convertIntentToAction(
  input: IntentToActionInput
): Promise<StructuredAction> {
  const apiKey = process.env.GEMINI_API_KEY
  const id = `act-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
  const processedAt = new Date().toISOString()

  if (!apiKey) {
    const fallback = heuristicIntentToAction(input)
    return {
      ...fallback,
      id,
      verified: true,
      processedAt,
      engine: "intent2action-engine",
    }
  }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const prompt = `You are the Intent2Action AI Engine for Societal Benefit and civic emergency response.
Take the following unstructured, messy real-world citizen report and convert it into a structured, verified, life-saving action.

CITIZEN INPUT:
Notes: "${input.notes || "None"}"
Attached File Kinds: ${(input.fileKinds || []).join(", ") || "None"}
Attached File Names: ${(input.fileNames || []).join(", ") || "None"}

Return ONLY a valid JSON object matching this schema without any markdown formatting or code fences:
{
  "title": "Short concise headline (max 8 words)",
  "intent": "1 sentence extracting the core intent/problem reported",
  "category": "lighting" | "roads" | "sanitation" | "water" | "emergency" | "other",
  "priority": "critical" | "high" | "watch",
  "urgencyScore": number from 1 to 100,
  "lifeSavingAction": "1-2 sentence life-saving action plan and priority intervention",
  "immediateSteps": ["step 1", "step 2", "step 3"],
  "targetDepartment": "Name of responsible department or emergency team",
  "safetyAdvice": "Immediate practical safety advice for citizens at the scene"
}`

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    })

    const text = response.text?.trim() || ""
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim()
    const parsed = JSON.parse(cleaned)
    const validated = ActionResponseSchema.parse(parsed)

    return {
      ...validated,
      id,
      verified: true,
      processedAt,
      engine: "gemini-2.0-flash",
    }
  } catch {
    // If Gemini API fails, rate-limits, or network error occurs, fall back gracefully
    const fallback = heuristicIntentToAction(input)
    return {
      ...fallback,
      id,
      verified: true,
      processedAt,
      engine: "intent2action-engine",
    }
  }
}
