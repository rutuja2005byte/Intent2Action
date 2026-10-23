import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import {
  CATEGORY_LABELS,
  INITIAL_REPORTS,
  formatDate,
} from "@/lib/reports"

export const metadata: Metadata = {
  title: "Track",
}

export default function TrackPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8 max-w-2xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Track</h1>
        <p className="text-muted-foreground">
          Example status and resolution progress for sample reports.
        </p>
      </div>
      <div className="grid gap-4">
        {INITIAL_REPORTS.map((report) => (
          <article key={report.id}>
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle>{report.title}</CardTitle>
                  <CardDescription>
                    {report.location} · {formatDate(report.createdAt)}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="capitalize">
                  {report.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {report.description}
                </p>
                <Badge variant="secondary">
                  {CATEGORY_LABELS[report.category]}
                </Badge>
                <Progress value={report.progress} className="w-full">
                  <ProgressLabel>Resolution</ProgressLabel>
                  <ProgressValue />
                </Progress>
              </CardContent>
            </Card>
          </article>
        ))}
      </div>
    </main>
  )
}
