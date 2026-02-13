
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ReportsTable } from "@/components/admin/ReportsTable"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function AdminReportsPage() {
    const [incidents, setIncidents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
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
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Gestione Segnalazioni</h1>
                <Button onClick={fetchReports} variant="outline" size="sm">
                    Aggiorna
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <ReportsTable incidents={incidents} />
            )}
        </div>
    )
}
