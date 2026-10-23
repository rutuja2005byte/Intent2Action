import Link from "next/link"

import { HomeAuthForms } from "@/components/home-auth-forms"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function HomePage() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-10 space-y-10">
      <div className="max-w-3xl space-y-4">
        <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
          Societal Benefit · Gemini-Powered AI Engine
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Intent2Action
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Transforming messy, unstructured real-world inputs (voice transcripts,
          incident photos, citizen distress notes) into structured, verified,
          and life-saving civic actions.
        </p>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex flex-col justify-between">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Convert Intent</CardTitle>
            <CardDescription>
              Submit unstructured text, voice, or photos to generate verified
              life-saving interventions via Gemini AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/upload"
              className={buttonVariants({ variant: "default", className: "w-full" })}
            >
              Launch AI Triage
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Urgent Alerts</CardTitle>
            <CardDescription>
              Review critical civic hazards, life-threatening electrical faults,
              and urgent road disruptions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/alert"
              className={buttonVariants({ variant: "outline", className: "w-full" })}
            >
              View Alerts
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Track Actions</CardTitle>
            <CardDescription>
              Monitor dispatched actions, department responses, and real-time
              resolution progress across Pune.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/track"
              className={buttonVariants({ variant: "outline", className: "w-full" })}
            >
              Track Progress
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="border-t pt-8">
        <div className="mb-6 space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Citizen Portal</h2>
          <p className="text-sm text-muted-foreground">
            Sign in or create an account to save report history and receive real-time action notifications.
          </p>
        </div>
        <HomeAuthForms />
      </div>
    </main>
  )
}
