"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ReportsTable, type Incident } from "@/components/admin/ReportsTable"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, AlertCircle, CheckCircle2, Calendar } from "lucide-react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { AdminStats } from "@/components/admin/AdminStats"

export default function AdminReportsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchReports = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('incidents')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Error fetching reports:", error)
        } else {
            setIncidents(data || [])
        }
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchReports()
    }, [fetchReports])

    // Calculations
    const total = incidents.length
    const open = incidents.filter(i => i.status === 'Open' || i.status === 'In Progress').length
    const closed = incidents.filter(i => i.status === 'Closed' || i.status === 'Resolved').length

    // Simple days free calc (mock logic if no data)
    const lastIncidentDate = incidents.length > 0 ? new Date(incidents[0].created_at) : null
    const daysFree = lastIncidentDate
        ? Math.floor((new Date().getTime() - lastIncidentDate.getTime()) / (1000 * 3600 * 24))
        : 0

    // Stats Grid
    const stats = (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStats
                title="Total Reports"
                value={total.toString()}
                icon={<FileText className="w-6 h-6" />}
                iconColor="bg-blue-500"
                trend={{
                    value: total > 0 ? "+1" : "0",
                    label: "new this week",
                    direction: "neutral"
                }}
            />
            <AdminStats
                title="Open Issues"
                value={open.toString()}
                icon={<AlertCircle className="w-6 h-6" />}
                iconColor="bg-orange-500"
                trend={{
                    value: total > 0 ? `${Math.round((open / total) * 100)}%` : "0%",
                    label: "of total",
                    direction: open > 0 ? "down" : "neutral"
                }}
            />
            <AdminStats
                title="Resolved"
                value={closed.toString()}
                icon={<CheckCircle2 className="w-6 h-6" />}
                iconColor="bg-green-500"
                trend={{
                    value: closed > 0 ? "+2" : "0",
                    label: "this month",
                    direction: "up"
                }}
            />
            <AdminStats
                title="Days Incident Free"
                value={daysFree.toString()}
                icon={<Calendar className="w-6 h-6" />}
                iconColor="bg-indigo-500"
                trend={{
                    value: daysFree > 30 ? "Safe" : "Caution",
                    label: "since last report",
                    direction: "neutral"
                }}
            />
        </div>
    )

    return (
        <AdminLayout
            title="Safety Dashboard"
            stats={stats}
            action={
                <Button
                    onClick={fetchReports}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 text-white hover:bg-white/20 border-white/20 hover:text-white"
                >
                    Refresh Data
                </Button>
            }
        >
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
                <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-white">
                    <h2 className="text-lg font-bold text-slate-800">Recent Reports</h2>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="p-0">
                        <ReportsTable incidents={incidents} />
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
