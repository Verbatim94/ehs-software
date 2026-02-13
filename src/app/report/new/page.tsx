
"use client"

import { useWizardStore } from "@/lib/store/wizard-store"
import WizardProgress from "@/components/wizard/WizardProgress"
import Step1Context from "@/components/wizard/Step1Context"
import Step2Description from "@/components/wizard/Step2Description"
import Step3Photos from "@/components/wizard/Step3Photos"
import Step4Analysis from "@/components/wizard/Step4Analysis"
import Step5Summary from "@/components/wizard/Step5Summary"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewReportPage() {
    const { currentStep, prevStep } = useWizardStore()

    // Step renderer
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1Context />
            case 2:
                return <Step2Description />
            case 3:
                return <Step3Photos />
            case 4:
                return <div className="p-8 text-center text-muted-foreground">Step 4: Analisi (In Construction)</div>
            case 5:
                return <div className="p-8 text-center text-muted-foreground">Step 5: Riepilogo (In Construction)</div>
            default:
                return <Step1Context />
        }
    }

    return (
        <div className="min-h-screen bg-muted/20 flex flex-col">
            {/* Header */}
            <div className="bg-background border-b p-4 flex items-center gap-4 sticky top-0 z-10">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="font-semibold text-lg">Nuova Segnalazione</h1>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                    Draft Autosaved
                </div>
            </div>

            {/* Progress */}
            <div className="bg-background px-4 pb-4 border-b">
                <WizardProgress />
            </div>

            {/* Step Content */}
            <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
                {renderStep()}
            </div>

            {/* Back Button for internal wizard nav (only > step 1) */}
            {currentStep > 1 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:static md:bg-transparent md:border-0 md:p-0 md:mt-4 flex justify-start max-w-4xl mx-auto w-full">
                    <Button variant="outline" onClick={prevStep} className="mr-auto">
                        Indietro
                    </Button>
                </div>
            )}
        </div>
    )
}
