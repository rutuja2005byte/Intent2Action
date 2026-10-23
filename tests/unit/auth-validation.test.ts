/**
 * Unit tests for the auth form validation logic (email + password rules).
 *
 * The validateEmail function is inlined in home-auth-forms.tsx. We mirror
 * the exact regex here to test it in isolation.
 */
import { describe, it, expect } from "vitest"

// Mirrors the function in components/home-auth-forms.tsx
function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

// Mirrors sign-in validation logic
function validateSignIn(
  email: string,
  password: string
): { ok: boolean; error?: string } {
  if (!validateEmail(email) || password.length < 8) {
    return {
      ok: false,
      error: "Enter a valid email and a password of at least 8 characters.",
    }
  }
  return { ok: true }
}

// Mirrors sign-up validation logic
function validateSignUp(
  email: string,
  password: string,
  confirm: string
): { ok: boolean; error?: string } {
  if (!validateEmail(email) || password.length < 8) {
    return {
      ok: false,
      error: "Enter a valid email and a password of at least 8 characters.",
    }
  }
  if (password !== confirm) {
    return { ok: false, error: "Passwords do not match." }
  }
  return { ok: true }
}

// ── validateEmail ─────────────────────────────────────────────────────────────

describe("validateEmail", () => {
  it("accepts standard email addresses", () => {
    expect(validateEmail("user@example.com")).toBe(true)
    expect(validateEmail("first.last+tag@subdomain.example.org")).toBe(true)
    expect(validateEmail("  user@example.com  ")).toBe(true) // trims whitespace
  })

  it("rejects email without @", () => {
    expect(validateEmail("userexample.com")).toBe(false)
  })

  it("rejects email without domain part", () => {
    expect(validateEmail("user@")).toBe(false)
  })

  it("rejects email without TLD", () => {
    expect(validateEmail("user@example")).toBe(false)
  })

  it("rejects empty string", () => {
    expect(validateEmail("")).toBe(false)
  })

  it("rejects email with spaces in local part", () => {
    expect(validateEmail("user name@example.com")).toBe(false)
  })
})

// ── Sign-in validation ────────────────────────────────────────────────────────

describe("validateSignIn", () => {
  it("accepts valid email and password >= 8 chars", () => {
    expect(validateSignIn("user@example.com", "password123")).toEqual({
      ok: true,
    })
  })

  it("rejects invalid email", () => {
    const result = validateSignIn("notanemail", "password123")
    expect(result.ok).toBe(false)
  })

  it("rejects password shorter than 8 characters", () => {
    const result = validateSignIn("user@example.com", "short")
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/8 characters/i)
  })

  it("accepts password of exactly 8 characters", () => {
    expect(validateSignIn("user@example.com", "12345678")).toEqual({ ok: true })
  })

  it("rejects empty password", () => {
    expect(validateSignIn("user@example.com", "").ok).toBe(false)
  })
})

// ── Sign-up validation ────────────────────────────────────────────────────────

describe("validateSignUp", () => {
  it("accepts matching passwords with valid email", () => {
    expect(
      validateSignUp("user@example.com", "securePass1", "securePass1")
    ).toEqual({ ok: true })
  })

  it("rejects mismatched passwords", () => {
    const result = validateSignUp(
      "user@example.com",
      "securePass1",
      "different"
    )
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/do not match/i)
  })

  it("rejects invalid email even with matching passwords", () => {
    expect(validateSignUp("bademail", "password1", "password1").ok).toBe(false)
  })

  it("rejects short password before checking match", () => {
    // password is short so we never reach the match check
    const result = validateSignUp("u@e.com", "short", "short")
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/8 characters/i)
  })

  it("rejects empty confirm field", () => {
    const result = validateSignUp("user@example.com", "securePass1", "")
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/do not match/i)
  })
})
