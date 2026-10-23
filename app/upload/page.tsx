import type { Metadata } from "next"

import { UploadForm } from "@/components/upload-form"

export const metadata: Metadata = {
  title: "Upload & Analyze | Intent2Action",
  description:
    "Transform unstructured real-world inputs into structured, verified life-saving actions powered by Gemini AI.",
}

export default function UploadPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8 max-w-2xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Convert Intent to Action
        </h1>
        <p className="text-muted-foreground">
          Submit unstructured citizen reports, voice notes, or hazard photos.
          Powered by Gemini AI to synthesize verified life-saving civic actions.
        </p>
      </div>
      <UploadForm />
    </main>
  )
}
