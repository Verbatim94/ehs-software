"use client"

import { useState } from "react"
import { useWizardStore } from "@/lib/store/wizard-store"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Loader2 } from "lucide-react"
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
            const { data: { user } } = await supabase.auth.getUser()

            // Prepare payload matches DB schema
            // NOTE: You'll need to ensure your Supabase 'incidents' table column 'five_whys' 
            // and 'action_items' are JSONB types to store these arrays of objects.
            const payload = {
                category: store.category,
                injury_subtype: store.injurySubtype || null,
                site: store.site,
                area: store.area,
                incident_date: store.incidentDate?.toISOString(),
                // incident_type: store.category, // Removed if redundant or map correctly

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
                event_summary: store.eventSummary, // Ensure DB has this column
                five_whys: store.fiveWhys,
                action_items: store.actionItems,
                analysis_extras: store.analysisExtras, // Ensure DB has this column or JSONB 'extras'

                status: 'submitted',
                submitted_at: new Date().toISOString(),
                created_by: user?.id
            }

            const { error } = await supabase
                .from('incidents')
                .insert(payload)

            if (error) {
                throw error
            }

            setIsSuccess(true)
            toast.success("Segnalazione inviata con successo!")
            store.reset()

            // Redirect after delay
            setTimeout(() => {
                router.push('/reports')
            }, 3000)

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Errore sconosciuto"
            console.error("Error submitting:", error)
            toast.error("Errore durante l'invio: " + message)
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
        <div className="max-w-3xl mx-auto pb-20">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Riepilogo</h2>
                <p className="text-slate-500">Controlla i dati prima di inviare la segnalazione.</p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">Dettagli Evento</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">

                    {/* Context */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="block text-slate-400 text-xs uppercase font-bold mb-1">Categoria</span>
                            <span className="font-medium text-slate-800">{store.category}</span>
                        </div>
                        <div>
                            <span className="block text-slate-400 text-xs uppercase font-bold mb-1">Luogo</span>
                            <span className="font-medium text-slate-800">{store.site} - {store.building}</span>
                        </div>
                        <div>
                            <span className="block text-slate-400 text-xs uppercase font-bold mb-1">Data</span>
                            <span className="font-medium text-slate-800">{store.incidentDate ? new Date(store.incidentDate).toLocaleDateString() : '-'}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Analysis Recap */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-blue-500 rounded-full" /> Analisi Cause
                        </h3>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase">Evento</span>
                                <p className="text-sm text-slate-800">{store.eventSummary || store.description}</p>
                            </div>

                            <div className="space-y-2 pt-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">5 Perché</span>
                                <div className="space-y-1">
                                    {store.fiveWhys.map((w, i) => (
                                        <div key={i} className="flex gap-2 text-sm">
                                            <span className="font-mono text-slate-400 text-xs pt-0.5">{i + 1}.</span>
                                            <span className="text-slate-700">{typeof w === 'string' ? w : w.cause}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Actions Recap */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-orange-500 rounded-full" /> Piano d&apos;Azione
                        </h3>
                        {store.actionItems.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">Nessuna azione definita.</p>
                        ) : (
                            <div className="grid gap-3">
                                {store.actionItems.map((action, i) => (
                                    <div key={i} className="flex items-start justify-between p-3 bg-white border border-slate-200 rounded-md shadow-sm">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${action.type === 'Containment' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                                    {action.type === 'Containment' ? 'IMMEDIATA' : 'CORRETTIVA'}
                                                </span>
                                                <span className="text-sm font-medium text-slate-800">{action.description}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 pl-16">
                                                Resp: <span className="font-semibold">{action.owner}</span> • Scadenza: {action.dueDate ? new Date(action.dueDate).toLocaleDateString() : '-'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </CardContent>
            </Card>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-50">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <Button variant="ghost" onClick={store.prevStep} disabled={isSubmitting}>Indietro</Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-green-600 hover:bg-green-700 text-white min-w-[200px] shadow-green-200 shadow-lg"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Invio in corso...
                            </>
                        ) : (
                            <>Invio Segnalazione <CheckCircle2 className="ml-2 w-4 h-4" /></>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
