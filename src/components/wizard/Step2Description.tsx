
"use client"

import { useForm, type Resolver } from "react-hook-form"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import BodyChart from "@/components/wizard/BodyChart"

const baseSchema = z.object({
    building: z.string().min(1, "Seleziona Edificio"),
    buildingOther: z.string().optional(),
    floor: z.string().min(1, "Seleziona Piano"),
    floorOther: z.string().optional(),
    room: z.string().optional(),
    description: z.string().min(10, "Descrizione troppo breve (min 10 caratteri)"),
})

const injurySchema = baseSchema.extend({
    injuredPersonName: z.string().min(1, "Inserisci nome infortunato"),
    jobTitle: z.string().optional(),
    supervisor: z.string().optional(),
    gender: z.enum(["Male", "Female", "Other"]).optional(),
})

type FormValues = z.infer<typeof injurySchema> & { buildingOther?: string, floorOther?: string }

export default function Step2Description() {
    const { category, building, floor, room, description, injuredPersonName, jobTitle, supervisor, gender, setField, nextStep, prevStep } = useWizardStore()

    // NOTE: Category is now "Infortunio" based on new store/Step1
    const isInjury = category === 'Infortunio'
    const schema = isInjury ? injurySchema : baseSchema

    const form = useForm<FormValues>({
        resolver: zodResolver(schema) as Resolver<FormValues>,
        defaultValues: {
            building: building || "",
            buildingOther: "",
            floor: floor || "",
            floorOther: "",
            room: room || "",
            description: description || "",
            injuredPersonName: injuredPersonName || "",
            jobTitle: jobTitle || "",
            supervisor: supervisor || "",
            gender: gender || undefined,
        }
    })

    const selectedBuilding = form.watch("building")
    const selectedFloor = form.watch("floor")

    function onSubmit(values: FormValues) {
        const finalBuilding = values.building === "Altro" ? values.buildingOther! : values.building
        const finalFloor = values.floor === "Altro" ? values.floorOther! : values.floor

        setField("building", finalBuilding)
        setField("floor", finalFloor)
        setField("room", values.room || "")
        setField("description", values.description)

        if (isInjury) {
            setField("injuredPersonName", values.injuredPersonName)
            setField("jobTitle", values.jobTitle || "")
            setField("supervisor", values.supervisor || "")
            setField("gender", values.gender || "")
        }
        nextStep()
    }

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-none border-0 md:border md:shadow-sm">
            <CardHeader>
                <CardTitle>Dettagli Evento</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <FormField
                                    control={form.control}
                                    name="building"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Edificio</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleziona..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {["2", "9", "10", "12", "6", "8"].map(b => (
                                                        <SelectItem key={b} value={b}>Edificio {b}</SelectItem>
                                                    ))}
                                                    <SelectItem value="Altro">Altro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {selectedBuilding === 'Altro' && (
                                    <FormField
                                        control={form.control}
                                        name="buildingOther"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="Specifica edificio..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <FormField
                                    control={form.control}
                                    name="floor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Piano</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleziona..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Seminterrato">Seminterrato</SelectItem>
                                                    <SelectItem value="-1">Piano -1</SelectItem>
                                                    {[2, 4, 5, 6, 7, 8].map(f => (
                                                        <SelectItem key={f} value={`Piano ${f}`}>Piano {f}</SelectItem>
                                                    ))}
                                                    <SelectItem value="Altro">Altro (Specificare)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {selectedFloor === 'Altro' && (
                                    <FormField
                                        control={form.control}
                                        name="floorOther"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="Specifica piano..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="room"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome/Numero Locale</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Es. Ufficio 101" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Alert className="bg-blue-50 border-blue-200">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertTitle>Guida alla Descrizione</AlertTitle>
                            <AlertDescription className="text-xs text-blue-700">
                                Cosa è successo? Dove? Quando? Come? Descrivi le condizioni (luce, rumore, meteo) e le azioni immediate intraprese.
                            </AlertDescription>
                        </Alert>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrizione dell&apos;evento</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descrivi dettagliatamente l'accaduto..."
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {isInjury && (
                            <div className="border-t pt-6 mt-6 space-y-6">
                                <h3 className="font-semibold text-lg text-red-600">Dettagli Infortunio</h3>

                                <FormField
                                    control={form.control}
                                    name="injuredPersonName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome Infortunato</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nome e Cognome" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="jobTitle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mansione</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Es. Operaio" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="supervisor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Responsabile Diretto</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nome Responsabile" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sesso</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleziona..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Male">Uomo</SelectItem>
                                                    <SelectItem value="Female">Donna</SelectItem>
                                                    <SelectItem value="Other">Altro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Body Chart Section - Explicit placement after context fields */}
                                <div className="space-y-2 pt-4">
                                    <FormLabel className="text-base font-semibold">Distretto anatomico interessato</FormLabel>
                                    <p className="text-sm text-muted-foreground pb-2">Indica con una X la parte anatomica coinvolta.</p>
                                    <BodyChart />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={prevStep} className="w-1/3">
                                Indietro
                            </Button>
                            <Button type="submit" className="w-2/3 h-12 text-lg">
                                Avanti
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
