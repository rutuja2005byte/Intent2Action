import { convertIntentToAction } from "@/lib/gemini"

export async function POST(request: Request) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return Response.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      )
    }

    if (!body || typeof body !== "object") {
      return Response.json(
        { error: "Request body must be an object" },
        { status: 400 }
      )
    }

    const payload = body as Record<string, unknown>
    const notes = typeof payload.notes === "string" ? payload.notes.trim() : ""
    const fileKinds = Array.isArray(payload.fileKinds)
      ? payload.fileKinds.filter((k): k is string => typeof k === "string")
      : []
    const fileNames = Array.isArray(payload.fileNames)
      ? payload.fileNames.filter((n): n is string => typeof n === "string")
      : []

    if (!notes && fileNames.length === 0) {
      return Response.json(
        { error: "Please provide a report description or attached files to analyze." },
        { status: 400 }
      )
    }

    if (notes.length > 2000) {
      return Response.json(
        { error: "Notes must be under 2000 characters." },
        { status: 400 }
      )
    }

    const action = await convertIntentToAction({
      notes,
      fileKinds,
      fileNames,
    })

    return Response.json({
      success: true,
      data: action,
    })
  } catch {
    return Response.json(
      { error: "An unexpected error occurred while analyzing the report." },
      { status: 500 }
    )
  }
}

export async function GET() {
  return Response.json({
    status: "ok",
    service: "Intent2Action AI Engine",
    model: "Gemini 2.0 Flash",
    problemAlignment: "Societal Benefit - Converting messy real-world inputs into verified life-saving actions",
  })
}
