
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ReportsTable } from "@/components/admin/ReportsTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ReportsPage() {
    const [incidents, setIncidents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchReports = async () => {
            const { data, error } = await supabase
                .from('incidents')
                .select('*')
                .order('created_at', { ascending: false })

            if (!error) setIncidents(data || [])
            setLoading(false)
        }
        fetchReports()
    }, [])

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Le mie Segnalazioni</h1>
                <Link href="/report/new">
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuova
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div>Caricamento...</div>
            ) : (
                <ReportsTable incidents={incidents} />
            )}
        </div>
    )
}
