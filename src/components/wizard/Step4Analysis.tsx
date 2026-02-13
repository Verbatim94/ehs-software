
"use client"

import { useState } from "react"
import { useWizardStore } from "@/lib/store/wizard-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, HelpCircle } from "lucide-react"

export default function Step4Analysis() {
    const { fiveWhys, rootCauses, actionItems, setField, nextStep, prevStep } = useWizardStore()

    // Local state for Root Cause
    const [localRootCause, setLocalRootCause] = useState(rootCauses || { category: "", subcategory: "", type: "Unsafe Condition" })

    const updateWhy = (index: number, value: string) => {
        const newWhys = [...fiveWhys]
        newWhys[index] = value
        setField("fiveWhys", newWhys)
    }

    const addAction = () => {
        setField("actionItems", [...actionItems, { description: "", owner: "", date: null }])
    }

    const removeAction = (index: number) => {
        const newActions = [...actionItems]
        newActions.splice(index, 1)
        setField("actionItems", newActions)
    }

    const updateAction = (index: number, field: string, value: any) => {
        const newActions = [...actionItems]
        newActions[index] = { ...newActions[index], [field]: value }
        setField("actionItems", newActions)
    }

    const handleNext = () => {
        // Basic validation
        if (!fiveWhys[0] || fiveWhys[0].length < 3) {
            alert("Inserisci almeno il 1° Perché.")
            return
        }
        if (!localRootCause.category) {
            alert("Seleziona la Categoria della Causa Radice.")
            return
        }
        setField("rootCauses", localRootCause)
        nextStep()
    }

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-none border-0 md:border md:shadow-sm">
            <CardHeader>
                <CardTitle>Analisi dell'evento</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible defaultValue="whys" className="w-full">

                    {/* 5 WHYS */}
                    <AccordionItem value="whys">
                        <AccordionTrigger>1. I 5 Perché (5 Whys)</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            <Alert className="bg-muted border-muted-foreground/20">
                                <HelpCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    Chiediti "Perché è successo?" fino a trovare la causa radice. Se la trovi prima del 5°, scrivi "N.A." o lascia vuoto.
                                </AlertDescription>
                            </Alert>

                            {fiveWhys.map((why, index) => (
                                <div key={index} className="grid grid-cols-[30px_1fr] items-center gap-2">
                                    <span className="font-bold text-muted-foreground">{index + 1}.</span>
                                    <Input
                                        placeholder={index === 0 ? "Perché...? (Obbligatorio)" : `Perché...?`}
                                        value={why}
                                        onChange={(e) => updateWhy(index, e.target.value)}
                                        className={index === 0 && !why ? "border-red-300" : ""}
                                    />
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>

                    {/* ROOT CAUSE */}
                    <AccordionItem value="root">
                        <AccordionTrigger>2. Causa Radice (Root Cause)</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo</Label>
                                    <Select
                                        value={localRootCause.type}
                                        onValueChange={(v) => setLocalRootCause({ ...localRootCause, type: v as any })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Unsafe Act">Unsafe Act (Comportamento)</SelectItem>
                                            <SelectItem value="Unsafe Condition">Unsafe Condition (Condizione)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Categoria Causa</Label>
                                    <Select
                                        value={localRootCause.category}
                                        onValueChange={(v) => setLocalRootCause({ ...localRootCause, category: v as any })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Competence/Knowledge">Competenza / Conoscenza</SelectItem>
                                            <SelectItem value="Behavior/Attitude">Comportamento / Atteggiamento</SelectItem>
                                            <SelectItem value="Management">Gestione / Organizzazione</SelectItem>
                                            <SelectItem value="Precaution/Attention">Precauzione / Attenzione</SelectItem>
                                            <SelectItem value="Personal Conditions">Condizioni Personali</SelectItem>
                                            <SelectItem value="Equipment">Attrezzature / Macchinari</SelectItem>
                                            <SelectItem value="Environment">Ambiente di Lavoro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* ACTION ITEMS */}
                    <AccordionItem value="actions">
                        <AccordionTrigger>3. Piano d'Azione</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            <p className="text-sm text-muted-foreground">Definisci le contromisure per evitare che l'evento si ripeta.</p>

                            {actionItems.map((action, index) => (
                                <div key={index} className="border p-3 rounded-md space-y-3 relative bg-muted/20">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeAction(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <div className="space-y-1">
                                        <Label>Contromisura / Azione</Label>
                                        <Input
                                            value={action.description}
                                            onChange={(e) => updateAction(index, 'description', e.target.value)}
                                            placeholder="Descrivi l'azione correttiva..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label>Responsabile</Label>
                                            <Input
                                                value={action.owner}
                                                onChange={(e) => updateAction(index, 'owner', e.target.value)}
                                                placeholder="Chi?"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Data Inizio</Label>
                                            <Input
                                                type="date"
                                                value={action.date ? action.date.toString() : ''}
                                                onChange={(e) => updateAction(index, 'date', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={addAction} className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Aggiungi Azione (Contromisura)
                            </Button>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="flex gap-4 pt-6">
                    <Button type="button" variant="outline" onClick={prevStep} className="w-1/3">
                        Indietro
                    </Button>
                    <Button onClick={handleNext} className="w-2/3 h-12 text-lg">
                        Avanti
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
