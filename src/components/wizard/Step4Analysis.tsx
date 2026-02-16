"use client"

import { useState, useEffect } from "react"
import { useWizardStore, WhyItem, ActionItem } from "@/lib/store/wizard-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
    Plus, Trash2, CheckCircle2,
    ArrowRight, Info, Lightbulb, AlertOctagon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

// --- GENERIC PHRASE DETECTION ---
const GENERIC_PHRASES = [
    // IT
    "errore umano", "disattenzione", "distrazione", "non ha fatto attenzione", "non stava attento",
    "ha sbagliato", "colpa", "fretta", "stress", "disorganizzazione", "mancanza di formazione",
    "formazione insufficiente", "non formato", "scarsa formazione", "non addestrato",
    "procedura non seguita", "sop non seguita", "wi non seguita", "non ha seguito la procedura",
    "non conforme", "mancato rispetto", "imprevisto", "fatalità", "sfortuna", "caso",
    "non so", "n/a", "na", "boh", "non ricordo", "non chiaro", "sempre fatto così",
    "abitudine", "routine", "mancanza di attenzione", "mancanza di comunicazione",
    "mancanza di controllo", "mancanza di supervisione",
    // EN
    "human error", "didn't pay attention", "not careful", "careless", "mistake",
    "inattention", "distraction", "rushed", "stress", "not trained", "lack of training",
    "procedure not followed", "didn't follow procedure", "non compliant", "unexpected",
    "bad luck", "accident", "i don't know", "n/a", "unclear", "we always do it this way"
]

const CONCRETE_TERMS = [
    "barriera", "protezione", "guard", "riparo", "checklist", "standard", "sop", "wi", "istruzione",
    "layout", "segnaletica", "marcatura", "ppe", "guanti", "occhiali", "manutenzione", "sostituzione",
    "taratura", "attrezzo", "macchina", "mulett", "carrello", "ergonomia", "postazione", "lockout", "loto"
]

const detectGenericPhrase = (text: string | null | undefined): boolean => {
    if (!text || typeof text !== 'string') return false
    const lower = text.toLowerCase().trim()
    if (lower.length < 3) return false // Too short to judge

    // 1. Check direct matches/includes
    const hasGeneric = GENERIC_PHRASES.some(phrase => lower.includes(phrase))

    // 2. Heuristic: Short + No Concrete Terms
    if (hasGeneric) {
        // It's generic. EXCEPT if it contains concrete terms ensuring specificity?
        // E.g. "Errore umano nel bypassare la barriera" -> still questionable, but slightly better.
        // For now, strict: if it has generic phrase, warn.
        return true
    }

    // 3. Short fuzzy check
    if (lower.length < 25 && !CONCRETE_TERMS.some(term => lower.includes(term))) {
        // Warning: short and vague? "Si è rotto" -> Vague.
        // Let's use this for "Soft" validation.
        return true
    }

    return false
}

// --- QUICK PICKS ---
const QUICK_PICKS = [
    "Aggiornare SOP / Work Instruction",
    "Brief safety 5 minuti sul punto",
    "Checklist pre-task",
    "Segnaletica / marking area",
    "Barriera / protezione / guard",
    "Manutenzione / sostituzione componente",
    "Audit rapido 10 minuti (1 settimana)",
    "Training mirato su task specifico",
    "Revisione layout / ergonomia postazione",
    "PPE: guanti / occhiali / protezioni"
]

export default function Step4Analysis() {
    const {
        fiveWhys = [],
        actionItems = [],
        eventSummary = "",
        analysisExtras = { standardInvolved: 'Nessuno / Non applicabile', riskBefore: '', riskAfter: '' },
        description,
        setField, nextStep, prevStep
    } = useWizardStore()

    const [fullMode, setFullMode] = useState(false)
    const [showStopEarlyModal, setShowStopEarlyModal] = useState(false)

    // --- INITIALIZATION ---
    useEffect(() => {
        // Prefill Event Summary if empty
        if (!eventSummary && description) {
            setField("eventSummary", description.substring(0, 140))
        }

        // Ensure at least one distinct Why item exists to start
        if (fiveWhys.length === 0) {
            setField("fiveWhys", [{ id: crypto.randomUUID(), cause: "", category: "" }])
        }

        // Ensure at least one Immediate Action exists
        if (actionItems.length === 0) {
            const due = new Date()
            due.setDate(due.getDate() + 2) // +2 days default
            setField("actionItems", [{
                id: crypto.randomUUID(),
                description: "",
                owner: "",
                dueDate: due,
                type: 'Containment', // Immediate
                completed: false
            }])
        }
    }, [])

    // --- HANDLERS: EVENT SUMMARY ---
    const handleSummaryChange = (val: string) => {
        setField("eventSummary", val.substring(0, 140))
    }

    // --- HANDLERS: 5 WHYS ---
    const updateWhy = (index: number, field: keyof WhyItem, value: string) => {
        const newWhys = [...fiveWhys]
        newWhys[index] = { ...newWhys[index], [field]: value }
        setField("fiveWhys", newWhys)
    }

    const addWhy = () => {
        if (fiveWhys.length >= 5) return
        setField("fiveWhys", [...fiveWhys, { id: crypto.randomUUID(), cause: "", category: "" }])
    }

    const removeWhy = (index: number) => {
        if (fiveWhys.length <= 1) return
        const newWhys = fiveWhys.filter((_, i) => i !== index)
        setField("fiveWhys", newWhys)
    }

    // --- HANDLERS: ACTIONS ---
    const updateAction = (index: number, field: keyof ActionItem, value: ActionItem[keyof ActionItem]) => {
        const newActions = [...actionItems]
        newActions[index] = { ...newActions[index], [field]: value }
        setField("actionItems", newActions)
    }

    const addSystemicAction = () => {
        const due = new Date()
        due.setDate(due.getDate() + 30) // +30 days default
        setField("actionItems", [...actionItems, {
            id: crypto.randomUUID(),
            description: "",
            owner: "",
            dueDate: due,
            type: 'Corrective',
            completed: false
        }])
    }

    const removeAction = (index: number) => {
        if (actionItems.length <= 1) {
            // Don't remove the last one, just clear it? OR allow removing if >1. 
            // Spec says "Mandatory: 1 countermeasure immediate".
            // Let's prevent removing the *last* immediate if it's the only one.
            // For simplicity, allow delete but ensure validate checks for 1.
        }
        const newActions = actionItems.filter((_, i) => i !== index)
        setField("actionItems", newActions)
    }

    // --- VALIDATION ---
    const canStopEarly = () => {
        return fiveWhys.length >= 3 &&
            fiveWhys.every(w => w.cause.length > 3 && w.category) &&
            fiveWhys[fiveWhys.length - 1].category !== 'People' // basic heuristic
    }

    const validateForm = () => {
        const errors = []
        if (!eventSummary || eventSummary.length < 5) errors.push("Descrizione sintetica mancante.")

        if (fiveWhys.length < 3) errors.push("Completa almeno 3 Perché.")
        fiveWhys.forEach((w, i) => {
            if (!w.cause) errors.push(`Perché #${i + 1}: Causa mancante.`)
            if (!w.category) errors.push(`Perché #${i + 1}: Categoria mancante.`)
        })

        const hasImmediate = actionItems.some(a => a.type === 'Containment' && a.description && a.owner && a.dueDate)
        if (!hasImmediate) errors.push("Inserisci almeno 1 contromisura immediata completa.")

        return errors
    }

    const handleNext = () => {
        const errors = validateForm()
        if (errors.length > 0) {
            alert(errors.join("\n"))
            return
        }
        nextStep()
    }

    // --- RENDER HELPERS ---
    const getPlaceholderWhy = (i: number) => {
        const p = [
            "Es.: Il carico era instabile durante la movimentazione.",
            "Es.: Non era presente una guida/standard per impilare i colli.",
            "Es.: La checklist pre-task non includeva il controllo stabilità.",
            "Es.: Non esiste un responsabile per aggiornare lo standard.",
            "Es.: Il processo di revisione standard non è pianificato."
        ]
        return p[i] || "Scrivi una causa specifica..."
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* HEADER */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Analisi</h2>
                <p className="text-slate-500">Individua la causa principale e definisci contromisure concrete.</p>
            </div>

            <div className="space-y-8">

                {/* A) EVENTO (1 FRASE) */}
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">A) Evento (1 frase)</CardTitle>
                            <span className={cn("text-xs font-mono", eventSummary.length > 140 ? "text-red-500" : "text-slate-400")}>
                                {eventSummary.length}/140
                            </span>
                        </div>
                        <CardDescription>Scrivi cosa è successo in modo semplice e oggettivo.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            <Label>Descrizione sintetica <span className="text-red-500">*</span></Label>
                            <Textarea
                                value={eventSummary}
                                onChange={(e) => handleSummaryChange(e.target.value)}
                                placeholder="Es.: Durante il prelievo, la mano è rimasta schiacciata tra due colli."
                                className="resize-none"
                                rows={2}
                            />
                            <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-blue-50/50 p-2 rounded">
                                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-blue-600 block mb-0.5">Come scrivere bene:</span>
                                    Descrivi solo il fatto, senza colpe. Evita &apos;disattenzione&apos;. Meglio: azione + condizione + conseguenza.
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* B) 5 PERCHÉ GUIDATI */}
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">B) 5 Perché (guidati)</CardTitle>
                                <CardDescription>Completa almeno 3 Perché. Puoi fermarti quando arrivi a una causa controllabile.</CardDescription>
                            </div>
                            <Badge variant={fiveWhys.length >= 3 ? "success" : "secondary"}>
                                {fiveWhys.length}/5
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="space-y-4">
                            {fiveWhys.map((rawItem, index) => {
                                // SAFETY: Handle legacy strings or undefined from stale state
                                const item = (typeof rawItem === 'string'
                                    ? { id: `legacy-${index}`, cause: rawItem, category: '' }
                                    : rawItem) || { id: `empty-${index}`, cause: '', category: '' }

                                const isGeneric = detectGenericPhrase(item?.cause)
                                return (
                                    <div key={item.id} className="relative pl-6 border-l-2 border-slate-200 ml-2">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-slate-600">Perché #{index + 1}</Label>
                                                {index > 0 && (
                                                    <Button variant="ghost" size="sm" onClick={() => removeWhy(index)} className="h-6 w-6 p-0 text-slate-300 hover:text-red-500">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div className="md:col-span-2 space-y-1">
                                                    <Input
                                                        value={item.cause}
                                                        onChange={(e) => updateWhy(index, 'cause', e.target.value)}
                                                        placeholder={getPlaceholderWhy(index)}
                                                        className={cn(isGeneric ? "border-orange-300 focus-visible:ring-orange-200" : "")}
                                                        maxLength={120}
                                                    />
                                                    {isGeneric && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="flex items-center gap-2 text-[11px] text-orange-600 bg-orange-50 px-2 py-1 rounded"
                                                        >
                                                            <Lightbulb className="w-3 h-3" />
                                                            <span>Risposta generica. Specifica: quale barriera mancava? quale azione?</span>
                                                        </motion.div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <Select value={item.category} onValueChange={(v) => updateWhy(index, 'category', v)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Categoria" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Process">Processo</SelectItem>
                                                            <SelectItem value="Equipment">Attrezzature</SelectItem>
                                                            <SelectItem value="People">Persone</SelectItem>
                                                            <SelectItem value="Environment">Ambiente</SelectItem>
                                                            <SelectItem value="Materials">Materiali</SelectItem>
                                                            <SelectItem value="Management">Gestione</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Optional Note Toggle */}
                                            {/* Simplified for "Lean" - can allow inline expansion if needed */}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                            {fiveWhys.length < 5 && (
                                <Button variant="outline" onClick={addWhy} className="flex-1 bg-white hover:bg-slate-50 text-blue-600 border-blue-200 border-dashed">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Aggiungi Perché
                                </Button>
                            )}

                            {fiveWhys.length >= 3 && (
                                <Button
                                    variant="subtle"
                                    onClick={() => setShowStopEarlyModal(true)}
                                    className="flex-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                                    Raggiunta causa sistemica
                                </Button>
                            )}
                        </div>

                        {/* Stop Early Confirmation Hint */}
                        {showStopEarlyModal && (
                            <Alert className="bg-green-50 border-green-200 mt-4">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-800 text-sm font-semibold">Confermi causa controllabile?</AlertTitle>
                                <AlertDescription className="text-green-700 text-xs mt-1">
                                    Se hai identificato un problema di standard, processo o attrezzatura, puoi passare alle contromisure.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* C) CONTROMISURE */}
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">C) Contromisure</CardTitle>
                        <CardDescription>Inserisci almeno 1 contromisura immediata con responsabile e data.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">

                        {actionItems.map((action, index) => (
                            <div key={action.id} className={cn("p-4 rounded-lg border relative", action.type === 'Containment' ? "bg-orange-50/30 border-orange-100" : "bg-blue-50/30 border-blue-100")}>
                                <div className="absolute top-3 right-3">
                                    <Button variant="ghost" size="icon" onClick={() => removeAction(index)} disabled={index === 0 && actionItems.length === 1} className="h-6 w-6 text-slate-300 hover:text-red-500">
                                        <XBtn />
                                    </Button>
                                </div>

                                <h4 className={cn("text-xs font-bold uppercase mb-3 flex items-center gap-2", action.type === 'Containment' ? "text-orange-600" : "text-blue-600")}>
                                    {action.type === 'Containment' ? <AlertOctagon className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                    {action.type === 'Containment' ? "Contromisura Immediata (24-48h)" : "Contromisura Sistemica (30gg)"}
                                </h4>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Azione</Label>
                                        <Textarea
                                            value={action.description}
                                            onChange={(e) => updateAction(index, 'description', e.target.value)}
                                            placeholder="Es.: Mettere protezione sul punto di schiacciamento e aggiornare WI."
                                            rows={2}
                                            maxLength={160}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Responsabile</Label>
                                            <Input
                                                value={action.owner}
                                                onChange={(e) => updateAction(index, 'owner', e.target.value)}
                                                placeholder="Nome / Ruolo"
                                                className="h-9"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Scadenza</Label>
                                            <Input
                                                type="date"
                                                value={action.dueDate ? new Date(action.dueDate).toISOString().split('T')[0] : ''}
                                                onChange={(e) => updateAction(index, 'dueDate', e.target.valueAsDate)}
                                                className="h-9"
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Picks for Action Description */}
                                    <div className="pt-2">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 block">Suggerimenti Rapidi</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {QUICK_PICKS.map(pick => (
                                                <button
                                                    key={pick}
                                                    onClick={() => updateAction(index, 'description', pick)}
                                                    className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                                                >
                                                    {pick}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button variant="outline" onClick={addSystemicAction} className="w-full border-dashed text-slate-500 hover:text-blue-600 hover:border-blue-300">
                            <Plus className="w-4 h-4 mr-2" />
                            Aggiungi contromisura sistemica
                        </Button>
                    </CardContent>
                </Card>

                {/* FULL MODE TOGGLE */}
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <Switch checked={fullMode} onCheckedChange={setFullMode} id="full-mode" />
                    <div>
                        <Label htmlFor="full-mode" className="font-bold text-slate-700">Analisi Completa</Label>
                        <p className="text-xs text-slate-500">Consigliata per casi medi/alti o ricorrenti (valutazione standard e rischi).</p>
                    </div>
                </div>

                {/* EXTRAS (If Full Mode) */}
                <AnimatePresence>
                    {fullMode && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <Card className="border-slate-200 shadow-sm mt-4">
                                <CardHeader className="py-4 border-b border-slate-100">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">Dettagli Aggiuntivi</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <Label>Standard coinvolto?</Label>
                                        <Select
                                            value={analysisExtras.standardInvolved}
                                            onValueChange={(v) => setField("analysisExtras", { ...analysisExtras, standardInvolved: v })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Nessuno / Non applicabile">Nessuno / N.A.</SelectItem>
                                                <SelectItem value="SOP">SOP</SelectItem>
                                                <SelectItem value="WI">WI (Work Instruction)</SelectItem>
                                                <SelectItem value="LOTO">LOTO</SelectItem>
                                                <SelectItem value="PPE">PPE</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Rischio (Prima)</Label>
                                        <Select
                                            value={analysisExtras.riskBefore}
                                            onValueChange={(v) => setField("analysisExtras", { ...analysisExtras, riskBefore: v })}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Low">Basso</SelectItem>
                                                <SelectItem value="Medium">Medio</SelectItem>
                                                <SelectItem value="High">Alto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Rischio (Dopo)</Label>
                                        <Select
                                            value={analysisExtras.riskAfter}
                                            onValueChange={(v) => setField("analysisExtras", { ...analysisExtras, riskAfter: v })}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Low">Basso</SelectItem>
                                                <SelectItem value="Medium">Medio</SelectItem>
                                                <SelectItem value="High">Alto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* BOTTOM BAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Button variant="ghost" onClick={prevStep}>Indietro</Button>
                    <div className="flex gap-2">
                        {/* <Button variant="ghost">Salva Bozza</Button> */}
                        <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]">
                            Salva e Continua <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function XBtn() { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg> }
