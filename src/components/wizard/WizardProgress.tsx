"use client"

import { useWizardStore } from "@/lib/store/wizard-store"
import { cn } from "@/lib/utils"
import { Check, Activity, FileText, Camera, Scan, FileCheck } from "lucide-react"

export default function WizardProgress() {
    const { currentStep, goToStep } = useWizardStore()

    const steps = [
        { id: 1, label: "Context", icon: Activity },
        { id: 2, label: "Details", icon: FileText },
        { id: 3, label: "Evidence", icon: Camera },
        { id: 4, label: "Analysis", icon: Scan },
        { id: 5, label: "Summary", icon: FileCheck },
    ]

    return (
        <div className="w-full px-4 py-6">
            <div className="mx-auto max-w-3xl">
                <div className="relative flex items-center justify-between">
                    {/* Background Line */}
                    <div className="absolute left-0 top-1/2 w-full -translate-y-1/2 px-2">
                        <div className="h-0.5 w-full bg-slate-100 rounded-full" />
                    </div>

                    {/* Progress Fill */}
                    <div className="absolute left-0 top-1/2 w-full -translate-y-1/2 px-2 pointer-events-none">
                        <div
                            className="h-0.5 bg-blue-500 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        />
                    </div>

                    {steps.map((step) => {
                        const isCompleted = currentStep > step.id
                        const isCurrent = currentStep === step.id
                        const Icon = step.icon

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center group">
                                <button
                                    onClick={() => isCompleted ? goToStep(step.id) : null}
                                    disabled={!isCompleted}
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-sm",
                                        isCompleted
                                            ? "border-blue-500 bg-blue-500 text-white shadow-blue-200"
                                            : isCurrent
                                                ? "border-blue-500 bg-white text-blue-500 ring-4 ring-blue-50 scale-110"
                                                : "border-slate-200 bg-white text-slate-300"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5 animate-in zoom-in spin-in-90 duration-300" />
                                    ) : (
                                        <Icon className="h-5 w-5" />
                                    )}
                                </button>

                                <span className={cn(
                                    "absolute -bottom-6 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap",
                                    isCurrent ? "text-blue-600 translate-y-0 opacity-100" :
                                        isCompleted ? "text-slate-500 translate-y-0 opacity-70" :
                                            "text-slate-300 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
