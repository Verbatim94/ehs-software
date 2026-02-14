import { Card, CardContent } from "@/components/ui/card"
import { Calendar, ShieldCheck, Trophy } from "lucide-react"

export function HomeStats({ daysFree }: { daysFree: number }) {
    return (
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-32 h-32" />
            </div>

            <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-2">Safety Record</p>
                        <h2 className="text-4xl font-extrabold">{daysFree}</h2>
                        <p className="text-white/90 text-sm mt-1 font-medium">Giorni senza infortuni</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                        <Trophy className="w-6 h-6 text-white" />
                    </div>
                </div>

                <div className="mt-6 flex items-center text-xs text-emerald-50">
                    <Calendar className="w-3 h-3 mr-1.5" />
                    <span>Ultimo incidente: 10 Ott 2025</span>
                </div>
            </CardContent>
        </Card>
    )
}
