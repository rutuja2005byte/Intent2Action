/**
 * Unit tests for the upload form's validation logic.
 *
 * The UploadForm component performs all validation in the onSubmit handler,
 * so we extract and test the rules as pure functions here to keep tests
 * framework-agnostic (no React rendering needed).
 */
import { describe, it, expect } from "vitest"
import { formatBytes } from "@/lib/reports"

// ── Constants mirrored from upload-form.tsx ──────────────────────────────────
const MAX_FILES = 5
const MAX_FILE_BYTES = 10 * 1024 * 1024

// ── Pure validation helpers (mirrors upload-form logic) ──────────────────────
type ValidationResult = { ok: true } | { ok: false; error: string }

function validateUpload(
  notes: string,
  files: Array<{ name: string; size: number; type: string }>
): ValidationResult {
  if (!notes.trim() && files.length === 0) {
    return { ok: false, error: "Add a note or at least one file." }
  }
  if (notes.length > 1000) {
    return { ok: false, error: "Keep notes under 1000 characters." }
  }
  if (files.length > MAX_FILES) {
    return { ok: false, error: `Choose at most ${MAX_FILES} files.` }
  }
  const oversized = files.find((f) => f.size > MAX_FILE_BYTES)
  if (oversized) {
    return {
      ok: false,
      error: `Each file must be ${formatBytes(MAX_FILE_BYTES)} or smaller.`,
    }
  }
  return { ok: true }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Upload form validation — empty submission", () => {
  it("rejects when notes is empty and no files are provided", () => {
    const result = validateUpload("", [])
    expect(result.ok).toBe(false)
    expect((result as { ok: false; error: string }).error).toMatch(/note|file/i)
  })

  it("rejects when notes is whitespace-only and no files provided", () => {
    const result = validateUpload("   \n\t  ", [])
    expect(result.ok).toBe(false)
  })

  it("accepts when notes has content even with no files", () => {
    expect(validateUpload("Broken streetlight on main road", [])).toEqual({
      ok: true,
    })
  })

  it("accepts when files are provided even with empty notes", () => {
    const file = { name: "photo.jpg", size: 50_000, type: "image/jpeg" }
    expect(validateUpload("", [file])).toEqual({ ok: true })
  })
})

describe("Upload form validation — notes length", () => {
  it("accepts notes of exactly 1000 characters", () => {
    const notes = "a".repeat(1000)
    expect(validateUpload(notes, [])).toEqual({ ok: true })
  })

  it("rejects notes of 1001 characters", () => {
    const notes = "a".repeat(1001)
    const result = validateUpload(notes, [])
    expect(result.ok).toBe(false)
    expect((result as { ok: false; error: string }).error).toMatch(/1000/i)
  })
})

describe("Upload form validation — file count", () => {
  const makeFile = (i: number) => ({
    name: `file${i}.jpg`,
    size: 100,
    type: "image/jpeg",
  })

  it("accepts exactly MAX_FILES files", () => {
    const files = Array.from({ length: MAX_FILES }, (_, i) => makeFile(i))
    expect(validateUpload("note", files)).toEqual({ ok: true })
  })

  it("rejects MAX_FILES + 1 files", () => {
    const files = Array.from({ length: MAX_FILES + 1 }, (_, i) => makeFile(i))
    const result = validateUpload("note", files)
    expect(result.ok).toBe(false)
    expect((result as { ok: false; error: string }).error).toMatch(
      new RegExp(String(MAX_FILES))
    )
  })
})

describe("Upload form validation — file size", () => {
  it("accepts a file of exactly MAX_FILE_BYTES", () => {
    const file = { name: "big.pdf", size: MAX_FILE_BYTES, type: "application/pdf" }
    expect(validateUpload("note", [file])).toEqual({ ok: true })
  })

  it("rejects a file one byte over the limit", () => {
    const file = {
      name: "toobig.mp4",
      size: MAX_FILE_BYTES + 1,
      type: "video/mp4",
    }
    const result = validateUpload("note", [file])
    expect(result.ok).toBe(false)
    expect((result as { ok: false; error: string }).error).toMatch(/10\.0 MB/i)
  })

  it("reports the limit using formatBytes correctly", () => {
    expect(formatBytes(MAX_FILE_BYTES)).toBe("10.0 MB")
  })
})
