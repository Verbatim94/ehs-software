export type IncidentStatus =
  | "Open"
  | "In Progress"
  | "Closed"
  | "Resolved"
  | "submitted"
  | "In Review"

export interface Incident {
  id: string
  report_number: number
  created_at: string
  category: string
  site: string
  status: IncidentStatus | string
  description: string
}
