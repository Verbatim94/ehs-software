
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

    // Step 3: Photos (managed via separate upload, but we store references here?)
    // For now, let's keep it simple.

    // Step 4: Analysis
    fiveWhys: string[] // Array of strings for now, or objects
    rootCauses: { category: string; subcategory: string; type: 'Unsafe Act' | 'Unsafe Condition' } | null
    actionItems: { description: string; owner: string; date: Date | null }[]

    // Meta
    currentStep: number
    totalSteps: number

    // Actions
    setField: (field: keyof WizardState, value: any) => void
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
            fiveWhys: ['', '', '', '', ''],
            rootCauses: null,
            actionItems: [],

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
                fiveWhys: ['', '', '', '', ''], rootCauses: null, actionItems: [],
                currentStep: 1
            })
        }),
        {
            name: 'incident-wizard-storage',
        }
    )
)
