export const CATEGORIES = [
  "lighting",
  "roads",
  "sanitation",
  "water",
  "other",
] as const

export type Category = (typeof CATEGORIES)[number]

export const STATUSES = ["submitted", "in review", "resolved"] as const

export type ReportStatus = (typeof STATUSES)[number]

export const PRIORITIES = ["critical", "high", "watch"] as const

export type Priority = (typeof PRIORITIES)[number]

export type Report = {
  id: string
  title: string
  category: Category
  description: string
  location: string
  status: ReportStatus
  priority: Priority
  progress: number
  createdAt: string
}

export const CATEGORY_LABELS: Record<Category, string> = {
  lighting: "Lighting",
  roads: "Roads",
  sanitation: "Sanitation",
  water: "Water",
  other: "Other",
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  watch: "Watch",
}

export const INITIAL_REPORTS: Report[] = [
  {
    id: "seed-1",
    title: "Live wire after a downed pole",
    category: "lighting",
    description:
      "A broken pole left a cable on the pavement near the bus stop. Pedestrians are stepping around it.",
    location: "FC Road, Shivajinagar",
    status: "in review",
    priority: "critical",
    progress: 35,
    createdAt: "2026-10-20T09:15:00.000Z",
  },
  {
    id: "seed-2",
    title: "Deep potholes by the junction",
    category: "roads",
    description:
      "Two large potholes are catching two-wheelers at the turn. Water collects there after rain.",
    location: "Jangli Maharaj Road",
    status: "submitted",
    priority: "high",
    progress: 15,
    createdAt: "2026-10-21T14:40:00.000Z",
  },
  {
    id: "seed-3",
    title: "Overflowing bin at the park gate",
    category: "sanitation",
    description:
      "The public bin at the north gate is overflowing and attracting stray animals each afternoon.",
    location: "Koregaon Park",
    status: "resolved",
    priority: "watch",
    progress: 100,
    createdAt: "2026-10-18T11:05:00.000Z",
  },
  {
    id: "seed-4",
    title: "No water in the east block since morning",
    category: "water",
    description:
      "The municipal tap has been dry since 6am. Residents are queuing at a tanker two streets away.",
    location: "Kothrud",
    status: "in review",
    priority: "high",
    progress: 55,
    createdAt: "2026-10-22T07:10:00.000Z",
  },
]

export const THEME_STORAGE_KEY = "intent2action-theme"

export function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value))
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
