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
import type { StructuredAction } from "@/lib/gemini"
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
  const fileHintId = `${formId}-file-hint`
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<Preview | null>(null)
  const [action, setAction] = useState<StructuredAction | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [actionError, setActionError] = useState("")

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

  async function generateAction(notes: string, files: PreviewFile[]) {
    setIsAnalyzing(true)
    setActionError("")
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes,
          fileNames: files.map((f) => f.name),
          fileKinds: files.map((f) => f.kind),
        }),
      })
      const payload = (await res.json()) as {
        success?: boolean
        data?: StructuredAction
        error?: string
      }
      if (!res.ok || !payload.success || !payload.data) {
        setActionError(payload.error || "Unable to extract intent from report.")
      } else {
        setAction(payload.data)
      }
    } catch {
      setActionError("Network error while communicating with AI engine.")
    } finally {
      setIsAnalyzing(false)
    }
  }

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
      setAction(null)
      return
    }

    if (notes.length > 1000) {
      setError("Keep notes under 1000 characters.")
      setPreview(null)
      setAction(null)
      return
    }

    if (files.length > MAX_FILES) {
      setError(`Choose at most ${MAX_FILES} files.`)
      setPreview(null)
      setAction(null)
      return
    }

    const oversized = files.find((file) => file.size > MAX_FILE_BYTES)
    if (oversized) {
      setError(`Each file must be ${formatBytes(MAX_FILE_BYTES)} or smaller.`)
      setPreview(null)
      setAction(null)
      return
    }

    setError("")
    const previewFiles: PreviewFile[] = files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || "unknown",
      kind: kindForFile(file),
    }))

    setPreview({
      notes,
      files: previewFiles,
      createdAt: new Date().toISOString(),
    })

    void generateAction(notes, previewFiles)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Report an Incident / Hazard</CardTitle>
          <CardDescription>
            Attach unstructured notes, voice transcripts, or incident photos.
            Powered by Gemini AI to extract intent and dispatch life-saving actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={onSubmit}
            noValidate
            aria-busy={isAnalyzing}
          >
            <div className="grid gap-2">
              <label htmlFor={`${formId}-notes`} className="text-sm font-medium">
                Incident Description / Unstructured Notes
              </label>
              <Textarea
                id={`${formId}-notes`}
                name="notes"
                maxLength={1000}
                rows={5}
                placeholder="e.g. Downed power line sparking near bus stand on FC road, or open deep manhole after rains..."
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor={`${formId}-files`} className="text-sm font-medium">
                Attachments (Voice notes, hazard photos, documents)
              </label>
              <input
                id={`${formId}-files`}
                name="files"
                type="file"
                multiple
                accept={ACCEPT}
                aria-describedby={fileHintId}
                className="block w-full text-sm file:mr-3 file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm"
              />
              <p id={fileHintId} className="text-xs text-muted-foreground">
                Up to {MAX_FILES} files, {formatBytes(MAX_FILE_BYTES)} each.
                Audio, images, video, PDF, and common documents.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="submit" disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing with Gemini AI..." : "Convert Intent to Action"}
              </Button>
            </div>
            {/* Always render the live region so screen readers catch
                announcements even when the element first mounts. */}
            <p
              className={error ? "text-sm text-destructive" : "sr-only"}
              aria-live="polite"
              aria-atomic="true"
            >
              {error}
            </p>
          </form>
        </CardContent>
      </Card>

      {/* AI Structured Action Output */}
      {isAnalyzing ? (
        <Card className="border-primary/50 bg-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="inline-block h-2.5 w-2.5 animate-ping rounded-full bg-primary" />
              Gemini AI Processing Unstructured Report...
            </CardTitle>
            <CardDescription>
              Parsing messy citizen input, evaluating hazard urgency, and synthesizing verified life-saving actions.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {actionError ? (
        <p className="text-sm text-destructive" role="alert" aria-live="polite">
          {actionError}
        </p>
      ) : null}

      {action ? (
        <Card className="border-primary/40 ring-1 ring-primary/20">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    action.priority === "critical"
                      ? "default"
                      : action.priority === "high"
                        ? "secondary"
                        : "outline"
                  }
                  className="uppercase tracking-wide"
                >
                  Priority: {action.priority} (Urgency {action.urgencyScore}/100)
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {action.category}
                </Badge>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Verified Action
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Engine: {action.engine}
              </span>
            </div>
            <div>
              <CardTitle className="text-xl font-bold">{action.title}</CardTitle>
              <CardDescription className="text-sm mt-1">
                Dispatched to: <strong className="text-foreground">{action.targetDepartment}</strong>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Extracted Citizen Intent
              </h3>
              <p className="text-sm">{action.intent}</p>
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3.5 space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                Life-Saving Action Plan
              </h3>
              <p className="text-sm font-medium leading-relaxed">
                {action.lifeSavingAction}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Immediate Response Protocol
              </h3>
              <ol className="list-decimal pl-5 text-sm space-y-1 text-muted-foreground">
                {action.immediateSteps.map((step, idx) => (
                  <li key={idx} className="leading-snug">
                    <span className="text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {action.safetyAdvice ? (
              <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-800 dark:text-amber-200">
                <strong>Citizen On-Scene Guidance: </strong>
                {action.safetyAdvice}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Local Preview of files and notes */}
      {preview ? (
        <Card>
          <CardHeader>
            <CardTitle>Report Submission Details</CardTitle>
            <CardDescription>
              Local record timestamp and payload summary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Timestamp</dt>
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
                <dt className="text-muted-foreground">Submitted Notes</dt>
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
                {preview.files.map((file, index) => (
                  <li
                    key={`${file.name}-${file.size}-${index}`}
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
