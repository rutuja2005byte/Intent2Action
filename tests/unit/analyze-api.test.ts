import { describe, it, expect } from "vitest"
import { POST, GET } from "@/app/api/analyze/route"

describe("app/api/analyze/route", () => {
  it("GET returns service status and problem statement alignment", async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.status).toBe("ok")
    expect(data.service).toContain("Intent2Action")
    expect(data.problemAlignment).toContain("Societal Benefit")
  })

  it("POST returns 400 when body is invalid JSON or empty", async () => {
    const req = new Request("http://localhost:3000/api/analyze", {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "application/json" },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeTruthy()
  })

  it("POST returns 400 when both notes and files are empty", async () => {
    const req = new Request("http://localhost:3000/api/analyze", {
      method: "POST",
      body: JSON.stringify({ notes: "", fileNames: [] }),
      headers: { "Content-Type": "application/json" },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain("Please provide a report description")
  })

  it("POST returns 400 when notes exceed 2000 characters", async () => {
    const req = new Request("http://localhost:3000/api/analyze", {
      method: "POST",
      body: JSON.stringify({ notes: "a".repeat(2001) }),
      headers: { "Content-Type": "application/json" },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain("under 2000 characters")
  })

  it("POST converts unstructured report into structured life-saving action", async () => {
    const req = new Request("http://localhost:3000/api/analyze", {
      method: "POST",
      body: JSON.stringify({
        notes: "Live wire hanging over bus stop, pedestrians stepping around it.",
        fileKinds: ["image"],
        fileNames: ["downed_wire.jpg"],
      }),
      headers: { "Content-Type": "application/json" },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data).toBeTruthy()
    expect(data.data.category).toBe("lighting")
    expect(data.data.priority).toBe("critical")
    expect(data.data.lifeSavingAction).toBeTruthy()
    expect(data.data.immediateSteps.length).toBeGreaterThanOrEqual(1)
    expect(data.data.verified).toBe(true)
  })
})
