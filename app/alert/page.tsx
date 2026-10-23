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
  INITIAL_REPORTS,
  PRIORITY_LABELS,
  formatDate,
  type Priority,
} from "@/lib/reports"

export const metadata: Metadata = {
  title: "Alert",
}

const ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  watch: 2,
}

export default function AlertPage() {
  const alerts = INITIAL_REPORTS.filter(
    (report) => report.priority === "critical" || report.priority === "high"
  ).sort((a, b) => ORDER[a.priority] - ORDER[b.priority])

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8 max-w-2xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Alert</h1>
        <p className="text-muted-foreground">
          Example reports that need attention. Priority is shown as a label,
          not as a live feed.
        </p>
      </div>
      <div className="grid gap-4">
        {alerts.map((report) => (
          <article key={report.id}>
            <Card
              className={
                report.priority === "critical"
                  ? "ring-1 ring-foreground"
                  : undefined
              }
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle>{report.title}</CardTitle>
                  <CardDescription>
                    {report.location} · {formatDate(report.createdAt)}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    report.priority === "critical" ? "default" : "outline"
                  }
                >
                  {PRIORITY_LABELS[report.priority]}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {report.description}
                </p>
              </CardContent>
            </Card>
          </article>
        ))}
      </div>
    </main>
  )
}
