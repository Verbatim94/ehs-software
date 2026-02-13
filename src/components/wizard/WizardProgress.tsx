
"use client"

import { useWizardStore } from "@/lib/store/wizard-store"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export default function WizardProgress() {
    const { currentStep, totalSteps, goToStep } = useWizardStore()

    const steps = [
        { id: 1, label: "Tipo & Luogo" },
        { id: 2, label: "Descrizione" },
        { id: 3, label: "Foto" },
        { id: 4, label: "Analisi" },
        { id: 5, label: "Riepilogo" },
    ]

    return (
        <div className="w-full py-4">
            <div className="relative flex items-center justify-between">
                {/* Progress Line Background */}
                <div className="absolute left-0 top-1/2 -z-10 h-1 w-full -translate-y-1/2 rounded bg-muted" />

                {/* Active Progress Line */}
                <div
                    className="absolute left-0 top-1/2 -z-10 h-1 -translate-y-1/2 rounded bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                />

                {steps.map((step) => {
                    const isCompleted = currentStep > step.id
                    const isCurrent = currentStep === step.id

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                            <button
                                onClick={() => goToStep(step.id)}
                                disabled={!isCompleted && !isCurrent}
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                                    isCompleted ? "border-primary bg-primary text-primary-foreground" :
                                        isCurrent ? "border-primary bg-background text-primary" :
                                            "border-muted bg-background text-muted-foreground"
                                )}
                            >
                                {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                            </button>
                            <span className={cn(
                                "hidden text-xs font-medium md:block",
                                isCurrent ? "text-primary" : "text-muted-foreground"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
