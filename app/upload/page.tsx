import type { Metadata } from "next"

import { UploadForm } from "@/components/upload-form"

export const metadata: Metadata = {
  title: "Upload",
}

export default function UploadPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8 max-w-2xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Upload</h1>
        <p className="text-muted-foreground">
          Build a compact report preview from text and files. Nothing is sent
          to a server.
        </p>
      </div>
      <UploadForm />
    </main>
  )
}
