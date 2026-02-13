
"use client"

import { useState } from "react"
import { useWizardStore } from "@/lib/store/wizard-store"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function Step5Summary() {
    const store = useWizardStore()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async () => {
        setIsSubmitting(true)
        const supabase = createClient()

        try {
            // 1. Get current user (mock if no auth for local MVP, but we need uuid)
            const { data: { user } } = await supabase.auth.getUser()

            // Prepare payload matches DB schema
            const payload = {
                category: store.category,
                injury_subtype: store.injurySubtype || null,
                site: store.site,
                area: store.area,
                incident_date: store.incidentDate?.toISOString(),
                incident_type: store.category, // schema has incident_type, category was added in my updated schema. Let's check schema.
                // In updated schema I used 'category' text check.

                // Step 2
                building: store.building,
                floor: store.floor,
                room: store.room,
                description: store.description,

                // Injury specific
                injured_person_name: store.injuredPersonName || null,
                job_title: store.jobTitle || null,
                supervisor: store.supervisor || null,
                gender: store.gender || null,
                body_parts: store.bodyParts.length > 0 ? store.bodyParts : null,

                // Step 4
                five_whys: store.fiveWhys,
                root_causes: store.rootCauses,
                action_items: store.actionItems,

                status: 'submitted',
                submitted_at: new Date().toISOString(),
                created_by: user?.id // might be undefined if anon, RLS will block or allow depending on setup
            }

            const { error } = await supabase
                .from('incidents')
                .insert(payload)

            if (error) throw error

            setIsSuccess(true)
            toast.success("Segnalazione inviata con successo!")
            store.reset()

            // Redirect after delay
            setTimeout(() => {
                router.push('/reports')
            }, 2000)

        } catch (error: any) {
            console.error("Error submitting:", error)
            toast.error("Errore durante l'invio: " + (error.message || "Unknown error"))
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <Card className="w-full max-w-2xl mx-auto shadow-none border-0 md:border md:shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                    <CheckCircle2 className="h-20 w-20 text-green-500" />
                    <h2 className="text-2xl font-bold text-center">Segnalazione Inviata!</h2>
                    <p className="text-muted-foreground text-center">
                        La tua segnalazione è stata registrata correttamente.
                        <br />Verrai reindirizzato alla lista delle tue segnalazioni.
                    </p>
                    <Button onClick={() => router.push('/reports')}>
                        Vai alle mie segnalazioni
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-none border-0 md:border md:shadow-sm">
            <CardHeader>
                <CardTitle>Riepilogo e Invio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Context */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Contesto</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-muted-foreground text-xs">Categoria</span>
                            <span className="font-medium">{store.category}</span>
                        </div>
                        <div>
                            <span className="block text-muted-foreground text-xs">Sede</span>
                            <span className="font-medium">{store.site} {store.area ? ` - ${store.area}` : ''}</span>
                        </div>
                        <div>
                            <span className="block text-muted-foreground text-xs">Data Evento</span>
                            <span className="font-medium">{store.incidentDate ? new Date(store.incidentDate).toLocaleString() : '-'}</span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Description */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Descrizione</h3>
                    <div className="text-sm space-y-2">
                        <p><span className="text-muted-foreground">Luogo:</span> {store.building}, Piano {store.floor} {store.room && `, ${store.room}`}</p>
                        <p className="whitespace-pre-wrap bg-muted/30 p-2 rounded-md font-mono text-xs">{store.description}</p>
                    </div>

                    {store.category === 'Infortunio' && (
                        <div className="mt-2 p-2 border rounded-md bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20">
                            <p className="font-semibold text-red-700 text-sm mb-1">Dettagli Infortunio</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <p><span className="text-muted-foreground">Nome:</span> {store.injuredPersonName}</p>
                                <p><span className="text-muted-foreground">Parti corpo:</span> {store.bodyParts.map(p => p.label).join(", ") || "Nessuna"}</p>
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Analysis */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Analisi</h3>
                    <div className="text-sm">
                        <p><span className="text-muted-foreground">Causa Radice:</span> {store.rootCauses?.category || "-"} ({store.rootCauses?.type})</p>
                        <div className="mt-2">
                            <span className="text-muted-foreground block mb-1">Azioni Correttive ({store.actionItems.length}):</span>
                            <ul className="list-disc list-inside space-y-1 pl-1">
                                {store.actionItems.map((action, i) => (
                                    <li key={i}>{action.description} <span className="text-xs text-muted-foreground">(Resp: {action.owner})</span></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <Button type="button" variant="outline" onClick={store.prevStep} className="w-1/3" disabled={isSubmitting}>
                        Indietro
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="w-2/3 h-12 text-lg bg-green-600 hover:bg-green-700 text-white"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Invio in corso...
                            </>
                        ) : (
                            "Invia Segnalazione"
                        )}
                    </Button>
                </div>

            </CardContent>
        </Card>
    )
}
