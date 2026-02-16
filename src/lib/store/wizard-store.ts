
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type IncidentCategory = 'Hazard Report' | 'Near Miss' | 'First aid' | 'Infortunio' | 'Other'
export type Severity = 'Low' | 'Medium' | 'High'
export type BodyView = 'front' | 'back'

export interface BodyPart {
    id: string
    label: string
    view: BodyView
}

// Exported interfaces for Step 4
export interface WhyItem {
    id: string
    cause: string
    category: string
}

export interface ActionItem {
    id: string
    type: 'Containment' | 'Corrective' | 'Preventive'
    description: string
    owner: string
    dueDate: Date | null
}

export interface AnalysisExtras {
    standardInvolved: string
    riskBefore: string
    riskAfter: string
}

export interface WizardState {
    // Step 1: Context
    category: IncidentCategory | ''
    injurySubtype: 'On-site' | 'Commuting' | ''
    site: string
    area: string
    incidentDate: Date | null

    // Step 2: Description
    description: string
    building: string
    floor: string
    room: string
    // Injury specific
    injuredPersonName: string
    jobTitle: string
    supervisor: string
    gender: 'Male' | 'Female' | 'Other' | ''
    bodyParts: BodyPart[]

    // Step 3: Photos (managed via separate upload)

    // Step 4: Analysis
    fiveWhys: WhyItem[]
    rootCauses: { category: string; subcategory: string; type: 'Unsafe Act' | 'Unsafe Condition' } | null
    actionItems: ActionItem[]
    eventSummary: string
    analysisExtras: AnalysisExtras

    // Meta
    currentStep: number
    totalSteps: number

    // Actions
    setField: (field: keyof WizardState, value: unknown) => void
    nextStep: () => void
    prevStep: () => void
    reset: () => void
    goToStep: (step: number) => void
}

export const useWizardStore = create<WizardState>()(
    persist(
        (set) => ({
            category: '',
            injurySubtype: '',
            site: '',
            area: '',
            incidentDate: null,
            description: '',
            building: '',
            floor: '',
            room: '',
            injuredPersonName: '',
            jobTitle: '',
            supervisor: '',
            gender: '',
            bodyParts: [],
            // Initialize with 5 empty WhyItems with IDs
            fiveWhys: Array.from({ length: 5 }).map((_, i) => ({ id: `why-${i}`, cause: '', category: '' })),
            rootCauses: null,
            actionItems: [],
            eventSummary: '',
            analysisExtras: { standardInvolved: 'Nessuno / Non applicabile', riskBefore: '', riskAfter: '' },

            currentStep: 1,
            totalSteps: 5,

            setField: (field, value) => set((state) => ({ ...state, [field]: value })),
            nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, state.totalSteps) })),
            prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
            goToStep: (step) => set({ currentStep: step }),
            reset: () => set({
                category: '', injurySubtype: '', site: '', area: '', incidentDate: null,
                description: '', building: '', floor: '', room: '',
                injuredPersonName: '', jobTitle: '', supervisor: '', gender: '', bodyParts: [],
                fiveWhys: Array.from({ length: 5 }).map((_, i) => ({ id: `why-${i}`, cause: '', category: '' })),
                rootCauses: null, actionItems: [],
                eventSummary: '',
                analysisExtras: { standardInvolved: 'Nessuno / Non applicabile', riskBefore: '', riskAfter: '' },
                currentStep: 1
            })
        }),
        {
            name: 'incident-wizard-storage-v3', // Changed name to force fresh state and avoid migration error
            // version property removed to rely on default behavior
        }
    )
)
