"use client"

import { useId, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Notice = { tone: "error" | "info"; text: string }

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function HomeAuthForms() {
  const signInId = useId()
  const signUpId = useId()
  const [signInNotice, setSignInNotice] = useState<Notice | null>(null)
  const [signUpNotice, setSignUpNotice] = useState<Notice | null>(null)

  function onSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get("email") ?? "")
    const password = String(data.get("password") ?? "")

    if (!validateEmail(email) || password.length < 8) {
      setSignInNotice({
        tone: "error",
        text: "Enter a valid email and a password of at least 8 characters.",
      })
      return
    }

    setSignInNotice({
      tone: "info",
      text: "Sign in is not connected. Nothing was sent or stored.",
    })
  }

  function onSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get("email") ?? "")
    const password = String(data.get("password") ?? "")
    const confirm = String(data.get("confirm") ?? "")

    if (!validateEmail(email) || password.length < 8) {
      setSignUpNotice({
        tone: "error",
        text: "Enter a valid email and a password of at least 8 characters.",
      })
      return
    }

    if (password !== confirm) {
      setSignUpNotice({
        tone: "error",
        text: "Passwords do not match.",
      })
      return
    }

    setSignUpNotice({
      tone: "info",
      text: "Sign up is not connected. No account was created.",
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Local form only. Credentials are not checked or saved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={onSignIn} noValidate>
            <div className="grid gap-2">
              <label htmlFor={`${signInId}-email`} className="text-sm font-medium">
                Email
              </label>
              <Input
                id={`${signInId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                maxLength={120}
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor={`${signInId}-password`}
                className="text-sm font-medium"
              >
                Password
              </label>
              <Input
                id={`${signInId}-password`}
                name="password"
                type="password"
                autoComplete="current-password"
                maxLength={72}
              />
            </div>
            <Button type="submit">Sign In</Button>
            {signInNotice ? (
              <p
                className={
                  signInNotice.tone === "error"
                    ? "text-sm text-destructive"
                    : "text-sm text-muted-foreground"
                }
                aria-live="polite"
              >
                {signInNotice.text}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>
            Local form only. No account is created from this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={onSignUp} noValidate>
            <div className="grid gap-2">
              <label htmlFor={`${signUpId}-email`} className="text-sm font-medium">
                Email
              </label>
              <Input
                id={`${signUpId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                maxLength={120}
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor={`${signUpId}-password`}
                className="text-sm font-medium"
              >
                Password
              </label>
              <Input
                id={`${signUpId}-password`}
                name="password"
                type="password"
                autoComplete="new-password"
                maxLength={72}
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor={`${signUpId}-confirm`}
                className="text-sm font-medium"
              >
                Confirm password
              </label>
              <Input
                id={`${signUpId}-confirm`}
                name="confirm"
                type="password"
                autoComplete="new-password"
                maxLength={72}
              />
            </div>
            <Button type="submit">Sign Up</Button>
            {signUpNotice ? (
              <p
                className={
                  signUpNotice.tone === "error"
                    ? "text-sm text-destructive"
                    : "text-sm text-muted-foreground"
                }
                aria-live="polite"
              >
                {signUpNotice.text}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
