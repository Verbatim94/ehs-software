"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ReportsTable } from "@/components/admin/ReportsTable"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Filter } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

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
        <div className="relative min-h-screen bg-slate-50 pb-20">
            {/* 1. BLUE HEADER BACKGROUND */}
            <div className="absolute top-0 w-full h-[300px] bg-gradient-to-r from-blue-700 to-indigo-600 rounded-b-[2rem] shadow-lg z-0" />

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative z-10 container mx-auto px-4 pt-6 md:pt-8 max-w-6xl">

                {/* 2. PAGE HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-white mb-6 md:mb-8 gap-3 md:gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight uppercase">Le Mie Segnalazioni</h1>
                        <p className="text-blue-100 text-xs md:text-sm opacity-90">Gestisci e monitora lo stato delle tue segnalazioni.</p>
                    </div>
                    <Link href="/report/new" className="w-full md:w-auto">
                        <Button size="lg" className="w-full md:w-auto bg-white text-blue-600 hover:bg-blue-50 border-none shadow-md font-bold">
                            <Plus className="h-5 w-5 mr-2" />
                            Nuova Segnalazione
                        </Button>
                    </Link>
                </div>

                {/* 3. FILTERS / SEARCH (Optional Visual Placeholder) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-white/10 border-none backdrop-blur-sm text-white">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-100 font-bold uppercase">Totali</p>
                                <p className="text-2xl font-bold">{incidents.length}</p>
                            </div>
                            <div className="bg-white/20 p-2 rounded-full"><FileText className="w-5 h-5" /></div>
                        </CardContent>
                    </Card>
                    {/* Can add more stats here later if needed */}
                </div>


                {/* 4. MAIN FLOATING CARD (TABLE) */}
                <Card className="border-none shadow-xl bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800">Storico Segnalazioni</CardTitle>
                                <CardDescription>Elenco completo di tutte le segnalazioni inviate.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="hidden md:flex">
                                    <Filter className="w-4 h-4 mr-2" /> Filtra
                                </Button>
                                <Input placeholder="Cerca..." className="w-40 md:w-64 h-9" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 text-center text-slate-400">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p>Caricamento in corso...</p>
                            </div>
                        ) : incidents.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                <p>Nessuna segnalazione trovata.</p>
                                <Link href="/report/new" className="text-blue-600 hover:underline text-sm font-medium mt-2 block">
                                    Crea la prima segnalazione
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <ReportsTable incidents={incidents} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
