"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, FileText, Map, Shield, User, Search, Settings, Leaf, Loader2 } from "lucide-react"
import { HomeStats } from "@/components/home/HomeStats"
import { HomeActionCard } from "@/components/home/HomeActionCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export default function HomePage() {
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState("Utente")
    const supabase = createClient()

    useEffect(() => {
        async function getProfile() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.user_metadata?.full_name) {
                setUserName(user.user_metadata.full_name)
            } else if (user?.email) {
                setUserName(user.email.split('@')[0])
            }
            setLoading(false)
        }
        getProfile()
    }, [supabase])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-slate-50 pb-20">
            {/* 1. BLUE HEADER BACKGROUND */}
            <div className="absolute top-0 w-full h-[320px] bg-gradient-to-r from-blue-600 to-indigo-700 rounded-b-[2rem] shadow-lg z-0" />

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative z-10 container mx-auto px-4 pt-6 max-w-5xl">

                {/* 2. TOP NAVBAR (Welcome & Search) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-white mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">EHS Dashboard</h1>
                        <p className="text-blue-100 text-sm opacity-90">Bentornato, {userName.split(' ')[0]}</p>
                    </div>

                    {/* Search Bar (Visual) */}
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/60">
                            <Search className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cerca..."
                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all backdrop-blur-sm"
                        />
                    </div>
                </div>

                {/* 3. HERO / WELCOME CARD */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                    {/* Left: User Profile / Welcome (Span 2) */}
                    <Card className="md:col-span-2 border-none shadow-xl bg-white/95 backdrop-blur overflow-hidden">
                        <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                            <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                                <User className="h-8 w-8 md:h-10 md:w-10 text-white" />
                            </div>
                            <div className="flex-1 w-full">
                                <h2 className="text-lg md:text-xl font-bold text-slate-800">{userName}</h2>
                                <p className="text-xs md:text-sm text-slate-500 mb-3 md:mb-4">EHS Manager</p>
                                <div className="flex flex-wrap gap-2 md:gap-3">
                                    <Link href="/profile">
                                        <Button size="sm" variant="outline" className="text-xs">Profilo</Button>
                                    </Link>
                                    <Link href="/settings">
                                        <Button size="sm" variant="ghost" className="text-xs">Impostazioni</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Safety Stats (Span 1) */}
                    <div className="md:col-span-1">
                        <HomeStats daysFree={124} />
                    </div>
                </div>

                {/* 4. ACTION GRID (Floating) */}
                <h3 className="text-base font-bold text-slate-700 mb-4 pl-1">Accesso Rapido</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* PRIMARY ACTION: New Report */}
                    <Link href="/report/new" className="col-span-2 md:col-span-1 block group">
                        <div className="h-full bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center text-white hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer">
                            <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm">
                                <Plus className="h-8 w-8 text-white" />
                            </div>
                            <span className="font-bold text-lg">Nuova Segnalazione</span>
                            <span className="text-blue-100 text-xs mt-1">Avvia Wizard</span>
                        </div>
                    </Link>

                    <HomeActionCard
                        title="Le mie Segnalazioni"
                        href="/reports"
                        icon={<FileText className="h-6 w-6 text-blue-600" />}
                        color="text-blue-600"
                        description="Visualizza storico"
                    />

                    <HomeActionCard
                        title="Planimetrie"
                        href="/plans"
                        icon={<Map className="h-6 w-6 text-orange-500" />}
                        color="text-orange-500"
                        description="Mappe interattive"
                    />

                    <HomeActionCard
                        title="Strumenti & Docs"
                        href="/tools"
                        icon={<Settings className="h-6 w-6 text-slate-600" />}
                        color="text-slate-600"
                        description="Policy e procedure"
                    />
                </div>

                {/* 5. ADDITIONAL INFO (e.g. Sustainability / News) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-md overflow-hidden group hover:shadow-lg transition-all">
                        <CardContent className="p-0 flex h-32">
                            <div className="w-1/3 bg-emerald-100 flex items-center justify-center">
                                <Leaf className="h-10 w-10 text-emerald-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="w-2/3 p-4 flex flex-col justify-center">
                                <h4 className="font-bold text-slate-800">Sostenibilità</h4>
                                <p className="text-xs text-slate-500 mt-1">Obiettivo -20% rifiuti entro Q4.</p>
                                <Button variant="link" className="px-0 text-emerald-600 h-auto self-start mt-2 text-xs">Vedi dettagli</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md overflow-hidden group hover:shadow-lg transition-all">
                        <CardContent className="p-0 flex h-32">
                            <div className="w-1/3 bg-purple-100 flex items-center justify-center">
                                <Shield className="h-10 w-10 text-purple-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="w-2/3 p-4 flex flex-col justify-center">
                                <h4 className="font-bold text-slate-800">Safety Brief</h4>
                                <p className="text-xs text-slate-500 mt-1">Nuova procedura DPI in vigore.</p>
                                <Button variant="link" className="px-0 text-purple-600 h-auto self-start mt-2 text-xs">Leggi avviso</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
