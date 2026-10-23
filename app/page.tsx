import { HomeAuthForms } from "@/components/home-auth-forms"

export default function HomePage() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-10 max-w-2xl space-y-3">
        <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Intent2Action
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Welcome</h1>
        <p className="text-muted-foreground">
          Use Upload to assemble a report preview, Alert for urgent examples,
          and Track for status. Sign In and Sign Up are shown here as forms
          only.
        </p>
      </div>
      <HomeAuthForms />
    </main>
  )
}
