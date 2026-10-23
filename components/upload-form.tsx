"use client"

import { useId, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { formatBytes } from "@/lib/reports"

const MAX_FILES = 5
const MAX_FILE_BYTES = 10 * 1024 * 1024
const ACCEPT =
  "audio/*,image/*,video/*,.pdf,.txt,.doc,.docx,.rtf,.csv,.odt"

type FileKind = "voice" | "image" | "video" | "document"

type PreviewFile = {
  name: string
  size: number
  type: string
  kind: FileKind
}

type Preview = {
  notes: string
  files: PreviewFile[]
  createdAt: string
}

function kindForFile(file: File): FileKind {
  if (file.type.startsWith("audio/")) return "voice"
  if (file.type.startsWith("image/")) return "image"
  if (file.type.startsWith("video/")) return "video"
  return "document"
}

export function UploadForm() {
  const formId = useId()
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<Preview | null>(null)

  const counts = useMemo(() => {
    if (!preview) return null
    return preview.files.reduce(
      (acc, file) => {
        acc[file.kind] += 1
        return acc
      },
      { voice: 0, image: 0, video: 0, document: 0 }
    )
  }, [preview])

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const notes = String(data.get("notes") ?? "").trim()
    const files = Array.from(
      (data.getAll("files") as File[]).filter((file) => file && file.size > 0)
    )

    if (!notes && files.length === 0) {
      setError("Add a note or at least one file.")
      setPreview(null)
      return
    }

    if (notes.length > 1000) {
      setError("Keep notes under 1000 characters.")
      setPreview(null)
      return
    }

    if (files.length > MAX_FILES) {
      setError(`Choose at most ${MAX_FILES} files.`)
      setPreview(null)
      return
    }

    const oversized = files.find((file) => file.size > MAX_FILE_BYTES)
    if (oversized) {
      setError(`Each file must be ${formatBytes(MAX_FILE_BYTES)} or smaller.`)
      setPreview(null)
      return
    }

    setError("")
    setPreview({
      notes,
      files: files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type || "unknown",
        kind: kindForFile(file),
      })),
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload a report</CardTitle>
          <CardDescription>
            Attach text, voice, images, video, or documents. This stays in the
            browser and is not submitted anywhere.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit} noValidate>
            <div className="grid gap-2">
              <label htmlFor={`${formId}-notes`} className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id={`${formId}-notes`}
                name="notes"
                maxLength={1000}
                rows={5}
                placeholder="Describe what happened."
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor={`${formId}-files`} className="text-sm font-medium">
                Files
              </label>
              <input
                id={`${formId}-files`}
                name="files"
                type="file"
                multiple
                accept={ACCEPT}
                className="block w-full text-sm file:mr-3 file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Up to {MAX_FILES} files, {formatBytes(MAX_FILE_BYTES)} each.
                Audio, images, video, PDF, and common documents.
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Preview report</Button>
            </div>
            {error ? (
              <p className="text-sm text-destructive" aria-live="polite">
                {error}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {preview ? (
        <Card>
          <CardHeader>
            <CardTitle>Structured preview</CardTitle>
            <CardDescription>
              Local preview only. No report was filed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Created</dt>
                <dd>
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(preview.createdAt))}
                </dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Attachments</dt>
                <dd>{preview.files.length}</dd>
              </div>
              <div className="grid gap-1 sm:col-span-2">
                <dt className="text-muted-foreground">Notes</dt>
                <dd className="whitespace-pre-wrap">
                  {preview.notes || "None"}
                </dd>
              </div>
            </dl>

            {counts ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline">Voice {counts.voice}</Badge>
                <Badge variant="outline">Images {counts.image}</Badge>
                <Badge variant="outline">Video {counts.video}</Badge>
                <Badge variant="outline">Documents {counts.document}</Badge>
              </div>
            ) : null}

            {preview.files.length > 0 ? (
              <ul className="mt-4 divide-y border-t text-sm">
                {preview.files.map((file) => (
                  <li
                    key={`${file.name}-${file.size}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 py-2"
                  >
                    <span className="font-medium">{file.name}</span>
                    <span className="text-muted-foreground">
                      {file.kind} · {formatBytes(file.size)} · {file.type}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
