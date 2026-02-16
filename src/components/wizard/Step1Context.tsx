
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useWizardStore } from "@/lib/store/wizard-store"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Info } from "lucide-react"

const formSchema = z.object({
    category: z.enum(["Hazard Report", "Near Miss", "First aid", "Infortunio", "Other"] as const),
    injurySubtype: z.enum(["On-site", "Commuting"] as const).optional(),
    site: z.string().min(1, "Seleziona una sede."),
    siteOther: z.string().optional(),
    area: z.string().optional(),
    incidentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Data non valida",
    }),
}).refine((data) => {
    if (data.category === "Infortunio" && !data.injurySubtype) {
        return false;
    }
    return true;
}, {
    message: "Seleziona se in sede o in itinere",
    path: ["injurySubtype"],
}).refine((data) => {
    if (data.site === "Altro" && (!data.siteOther || data.siteOther.length < 1)) {
        return false
    }
    return true
}, {
    message: "Specifica la sede",
    path: ["siteOther"]
});

export default function Step1Context() {
    const { category, site, area, incidentDate, injurySubtype, setField, nextStep } = useWizardStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            category: category || undefined,
            injurySubtype: injurySubtype || undefined,
            site: site || "",
            siteOther: "",
            area: area || "",
            incidentDate: incidentDate ? new Date(incidentDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        },
    })

    // Watch category to conditionally show injury subtype
    const selectedCategory = form.watch("category")
    const selectedSite = form.watch("site")

    function onSubmit(values: z.infer<typeof formSchema>) {
        setField("category", values.category)
        setField("injurySubtype", values.category === "Infortunio" ? values.injurySubtype : undefined)

        // Handle "Altro" site logic
        const finalSite = values.site === "Altro" ? values.siteOther! : values.site
        setField("site", finalSite)

        setField("area", values.area || "")
        setField("incidentDate", new Date(values.incidentDate))
        nextStep()
    }

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-none border-0 md:border md:shadow-sm">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Contesto della Segnalazione</span>
                    <DefinitionsDialog />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo di Segnalazione</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleziona categoria..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Hazard Report">Hazard Report (Pericolo)</SelectItem>
                                            <SelectItem value="Near Miss">Near Miss (Mancato Infortunio)</SelectItem>
                                            <SelectItem value="First aid">First Aid (Primo Soccorso)</SelectItem>
                                            <SelectItem value="Infortunio">Infortunio</SelectItem>
                                            <SelectItem value="Other">Altro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {selectedCategory === "Infortunio" && (
                            <FormField
                                control={form.control}
                                name="injurySubtype"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipologia Infortunio</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleziona..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="On-site">In Sede (On-site)</SelectItem>
                                                <SelectItem value="Commuting">In Itinere (Commuting)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="site"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sede</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleziona sede..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Saluggia (VC)">Saluggia (VC)</SelectItem>
                                                <SelectItem value="Bresso (MI)">Bresso (MI)</SelectItem>
                                                <SelectItem value="OGR (TO)">OGR (TO)</SelectItem>
                                                <SelectItem value="Altro">Altro (Specificare)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {selectedSite === 'Altro' && (
                                <FormField
                                    control={form.control}
                                    name="siteOther"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Specifica Altro</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Inserisci nome sede" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="area"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Area / Reparto (Opzionale)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Es. Produzione, Uffici, Lab..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="incidentDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data e Ora dell&apos;evento</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full h-12 text-lg mt-6">
                            Avanti
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

function DefinitionsDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-blue-600">
                    <Info className="h-4 w-4" />
                    Definizioni
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Definizioni Categorie</DialogTitle>
                    <DialogDescription>
                        Guida alla classificazione dell&apos;evento.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                    <div>
                        <span className="font-bold block text-amber-600">Hazard Report (Pericolo)</span>
                        <p>Condizione o atto non sicuro che potrebbe causare danni (es. cavo scoperto, pavimento scivoloso).</p>
                    </div>
                    <div>
                        <span className="font-bold block text-orange-600">Near Miss (Mancato Infortunio)</span>
                        <p>Evento imprevisto che non ha causato danni ma aveva il potenziale per farlo.</p>
                    </div>
                    <div>
                        <span className="font-bold block text-blue-600">First Aid (Primo Soccorso)</span>
                        <p>Infortunio lieve trattato sul posto senza intervento medico professionale significativo.</p>
                    </div>
                    <div>
                        <span className="font-bold block text-red-600">Infortunio</span>
                        <p>Evento che ha causato danni fisici richiedendo intervento medico o giorni di assenza.</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
