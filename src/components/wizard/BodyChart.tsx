"use client"

import React, { useState, useMemo, useRef } from "react"
import { useWizardStore } from "@/lib/store/wizard-store"
import { cn } from "@/lib/utils"
import { Zap, X, Scan, Bug } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// --- TYPES ---
type ViewMode = 'front' | 'back'

export default function BodyChart() {
    const { bodyParts, setField } = useWizardStore()
    const [view, setView] = useState<ViewMode>('front')
    const [debug, setDebug] = useState(false)
    const rootRef = useRef<HTMLDivElement>(null)
    const maxSelections = 3

    // We use the exact 24 macro IDs.
    // Store logic: previous implementation used `{ id, label, view }`.
    // We will stick to that to ensure compatibility, but the ID will be the macro ID.

    const selectedIds = useMemo(() => new Set(bodyParts.map(p => p.id)), [bodyParts])

    const handleZoneToggle = (zoneId: string, label: string) => {
        const current = new Set(selectedIds)
        if (current.has(zoneId)) {
            const newParts = bodyParts.filter(p => p.id !== zoneId)
            setField("bodyParts", newParts)
        } else {
            if (current.size >= maxSelections) {
                alert(`Puoi selezionare massimo ${maxSelections} aree.`)
                return
            }
            const newPart = { id: zoneId, label: label, view: view }
            setField("bodyParts", [...bodyParts, newPart])
        }
    }

    const handleClick = (e: React.MouseEvent) => {
        // Target the GROUP <g data-zone="..."> or any child inside it
        const target = (e.target as HTMLElement).closest("g[data-zone]") as HTMLElement | null
        if (!target) return

        const zoneId = target.getAttribute('data-zone')
        const label = target.getAttribute('data-label') || zoneId

        if (zoneId) {
            handleZoneToggle(zoneId, label!)
        }
    }

    return (
        <div className={`w-full relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl ${debug ? 'debug-mode' : ''}`} ref={rootRef}>

            {/* Tech Decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            <div className="absolute top-4 left-4 flex items-center gap-2 text-cyan-400 z-20">
                <Scan className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase">System Ready // {view.toUpperCase()} VIEW</span>
                <button
                    onClick={() => setDebug(!debug)}
                    className={`ml-4 flex items-center gap-1 px-2 py-0.5 text-[10px] border rounded transition-colors ${debug ? 'bg-red-900 border-red-500 text-red-100' : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}
                >
                    <Bug className="w-3 h-3" />
                    DEBUG
                </button>
            </div>

            {/* View Switcher/Toggle */}
            <div className="flex justify-center pt-8 pb-4">
                <div className="bg-slate-900 border border-slate-700 p-1 rounded-lg flex shadow-lg z-20">
                    <button
                        onClick={() => setView('front')}
                        className={cn(
                            "px-6 py-2 rounded-md text-xs font-mono uppercase tracking-widest transition-all",
                            view === 'front'
                                ? "bg-cyan-950 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                                : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        Frontale
                    </button>
                    <button
                        onClick={() => setView('back')}
                        className={cn(
                            "px-6 py-2 rounded-md text-xs font-mono uppercase tracking-widest transition-all",
                            view === 'back'
                                ? "bg-cyan-950 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                                : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        Dorsale
                    </button>
                </div>
            </div>

            {/* CANVAS */}
            <div
                className="relative z-10 p-4 md:p-8 flex justify-center min-h-[500px]"
                onClick={handleClick}
            >
                <style jsx global>{`
                    .zone-group { 
                        fill: #22d3ee; 
                        fill-opacity: 0; 
                        cursor: pointer; 
                        transition: all 0.15s ease;
                        stroke: transparent;
                        stroke-width: 1px;
                        pointer-events: all !important; /* Ensure transparent zones catch clicks */
                    }
                    .zone-group:hover { 
                        fill-opacity: 0.2; 
                        filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.5));
                    }
                    .zone-group.is-selected {
                         fill-opacity: 0.5 !important;
                         stroke: #67e8f9 !important;
                         stroke-width: 2px !important;
                         filter: drop-shadow(0 0 12px rgba(34, 211, 238, 0.8));
                    }
                    
                    /* DEBUG MODE STYLES */
                    .debug-mode .zone-group {
                        fill-opacity: 0.22 !important;
                        stroke: rgba(255, 255, 255, 0.35) !important;
                        stroke-width: 1px !important;
                        fill: #ff00ff !important; 
                    }
                    .debug-mode .zone-group.is-selected {
                        fill: #00ff00 !important;
                        fill-opacity: 0.6 !important;
                        stroke: #fff !important;
                        stroke-width: 2px !important;
                    }
                `}</style>

                <div className="w-full max-w-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                        >
                            {view === 'front'
                                ? <FrontSvg selectedIds={selectedIds} />
                                : <BackSvg selectedIds={selectedIds} />
                            }
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* SELECTED CHIPS */}
            <div className="bg-slate-900/50 border-t border-slate-800 p-4">
                <div className="flex flex-wrap gap-3 justify-center min-h-[40px]">
                    <AnimatePresence>
                        {bodyParts.map((p) => (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, y: 10 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                key={p.id}
                                className="flex items-center gap-2 bg-cyan-950/30 pl-3 pr-2 py-1.5 rounded border border-cyan-500/30 group hover:border-cyan-400/60 transition-colors"
                            >
                                <Zap className="w-3 h-3 text-cyan-400" />
                                <span className="text-xs font-mono text-cyan-100 uppercase tracking-tight">{p.label}</span>
                                <button
                                    className="ml-2 text-cyan-700 hover:text-cyan-300 transition-colors"
                                    onClick={(e) => {
                                        const newParts = bodyParts.filter(part => part.id !== p.id)
                                        setField("bodyParts", newParts)
                                    }}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {bodyParts.length === 0 && (
                        <span className="text-xs font-mono text-slate-600 py-2 flex items-center gap-2 animate-pulse">
                            [ ATTESA SELEZIONE ]
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

// --- SVG COMPONENTS with 24 Zones ---

function FrontSvg({ selectedIds }: { selectedIds: Set<string> }) {
    const isSel = (id: string) => selectedIds.has(id) ? "zone-group is-selected" : "zone-group"

    return (
        <svg viewBox="0 0 1024 1365" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto select-none">
            <image href="/assets/body-front.png" x="0" y="0" width="1024" height="1365" preserveAspectRatio="xMidYMid meet" />

            <g data-zone="head_neck" data-label="Testa / Collo" className={isSel("head_neck")}>
                <title>Testa / Collo</title>
                <ellipse cx="512" cy="220" rx="47" ry="56" />
                <ellipse cx="512" cy="208" rx="32" ry="35" />
                <rect x="493" y="273" width="38" height="44" rx="15" />
            </g>
            <g data-zone="chest_l" data-label="Torace sinistro" className={isSel("chest_l")}>
                <title>Torace sinistro</title>
                <path d="M444 320L491 320L491 377L451 388Q432 371 444 320Z" />
                <path d="M451 388L491 377L491 430L457 440Q438 424 451 388Z" />
                <path d="M421 371L451 388Q438 424 457 440L432 453Q402 430 421 371Z" />
            </g>
            <g data-zone="chest_r" data-label="Torace destro" className={isSel("chest_r")}>
                <title>Torace destro</title>
                <path d="M533 320L580 320Q592 371 573 388L533 377Z" />
                <path d="M533 377L573 388Q586 424 567 440L533 430Z" />
                <path d="M603 371L573 388Q586 424 567 440L592 453Q622 430 603 371Z" />
            </g>
            <g data-zone="abdomen" data-label="Addome" className={isSel("abdomen")}>
                <title>Addome</title>
                <path d="M457 440L491 430L491 483L461 493Q444 478 457 440Z" />
                <path d="M533 430L567 440Q580 478 563 493L533 483Z" />
                <path d="M461 493L491 483L491 536L466 546Q450 532 461 493Z" />
                <path d="M533 483L563 493Q574 532 558 546L533 536Z" />
            </g>
            <g data-zone="hip_l" data-label="Anca sinistra" className={isSel("hip_l")}>
                <title>Anca sinistra</title>
                <path d="M466 546L491 536L491 589L472 598Q454 583 466 546Z" />
                <path d="M444 571L472 598Q454 630 427 624Q426 595 444 571Z" />
            </g>
            <g data-zone="hip_r" data-label="Anca destra" className={isSel("hip_r")}>
                <title>Anca destra</title>
                <path d="M533 536L558 546Q570 583 552 598L533 589Z" />
                <path d="M580 571L552 598Q570 630 597 624Q598 595 580 571Z" />
            </g>
            <g data-zone="groin" data-label="Inguine" className={isSel("groin")}>
                <title>Inguine</title>
                <path d="M492 598L532 598L542 618Q512 654 483 618Z" />
            </g>
            <g data-zone="arm_upper_l" data-label="Braccio sinistro (alto)" className={isSel("arm_upper_l")}>
                <title>Braccio sinistro (alto)</title>
                <rect x="335" y="309" width="65" height="44" rx="18" />
                <rect x="317" y="353" width="65" height="124" rx="26" />
                <rect x="317" y="477" width="65" height="41" rx="15" />
            </g>
            <g data-zone="arm_lower_l" data-label="Avambraccio + Mano sinistra" className={isSel("arm_lower_l")}>
                <title>Avambraccio + Mano sinistra</title>
                <rect x="317" y="518" width="65" height="89" rx="26" />
                <rect x="303" y="571" width="65" height="94" rx="26" />
                <rect x="294" y="658" width="59" height="24" rx="9" />
                <rect x="277" y="668" width="72" height="61" rx="20" />
                <rect x="277" y="729" width="72" height="50" rx="17" />
            </g>
            <g data-zone="arm_upper_r" data-label="Braccio destro (alto)" className={isSel("arm_upper_r")}>
                <title>Braccio destro (alto)</title>
                <rect x="624" y="309" width="65" height="44" rx="18" />
                <rect x="642" y="353" width="65" height="124" rx="26" />
                <rect x="642" y="477" width="65" height="41" rx="15" />
            </g>
            <g data-zone="arm_lower_r" data-label="Avambraccio + Mano destra" className={isSel("arm_lower_r")}>
                <title>Avambraccio + Mano destra</title>
                <rect x="642" y="518" width="65" height="89" rx="26" />
                <rect x="656" y="571" width="65" height="94" rx="26" />
                <rect x="671" y="658" width="59" height="24" rx="9" />
                <rect x="676" y="668" width="72" height="61" rx="20" />
                <rect x="676" y="729" width="72" height="50" rx="17" />
            </g>
            <g data-zone="leg_upper_l" data-label="Coscia sinistra" className={isSel("leg_upper_l")}>
                <title>Coscia sinistra</title>
                <rect x="432" y="630" width="47" height="130" rx="24" />
                <rect x="479" y="630" width="35" height="130" rx="18" />
                <rect x="444" y="760" width="65" height="47" rx="15" />
            </g>
            <g data-zone="leg_lower_l" data-label="Gamba + Piede sinistro" className={isSel("leg_lower_l")}>
                <title>Gamba + Piede sinistro</title>
                <rect x="448" y="807" width="53" height="83" rx="24" />
                <rect x="432" y="807" width="17" height="83" rx="8" />
                <rect x="448" y="890" width="53" height="21" rx="8" />
                <path d="M432 910L497 910L509 925Q479 936 438 926Z" />
                <rect x="437" y="925" width="56" height="24" rx="11" />
            </g>
            <g data-zone="leg_upper_r" data-label="Coscia destra" className={isSel("leg_upper_r")}>
                <title>Coscia destra</title>
                <rect x="545" y="630" width="47" height="130" rx="24" />
                <rect x="510" y="630" width="35" height="130" rx="18" />
                <rect x="515" y="760" width="65" height="47" rx="15" />
            </g>
            <g data-zone="leg_lower_r" data-label="Gamba + Piede destro" className={isSel("leg_lower_r")}>
                <title>Gamba + Piede destro</title>
                <rect x="523" y="807" width="53" height="83" rx="24" />
                <rect x="576" y="807" width="17" height="83" rx="8" />
                <rect x="523" y="890" width="53" height="21" rx="8" />
                <path d="M527 910L592 910L586 926Q545 936 515 925Z" />
                <rect x="532" y="925" width="56" height="24" rx="11" />
            </g>

        </svg>
    )
}

function BackSvg({ selectedIds }: { selectedIds: Set<string> }) {
    const isSel = (id: string) => selectedIds.has(id) ? "zone-group is-selected" : "zone-group"

    return (
        <svg viewBox="0 0 1024 1365" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto select-none">
            <image href="/assets/body-back.png" x="0" y="0" width="1024" height="1365" preserveAspectRatio="xMidYMid meet" />

            <g data-zone="back_head_neck" data-label="Testa / Collo (retro)" className={isSel("back_head_neck")}>
                <title>Testa / Collo (retro)</title>
                <ellipse cx="512" cy="220" rx="47" ry="56" />
                <rect x="493" y="273" width="38" height="44" rx="15" />
            </g>
            <g data-zone="upper_back" data-label="Schiena alta" className={isSel("upper_back")}>
                <title>Schiena alta</title>
                <path d="M438 320L491 320L491 394L450 406Q426 388 438 320Z" />
                <path d="M533 320L586 320Q598 388 574 406L533 394Z" />
                <path d="M420 335L450 347L444 388L417 377Z" />
                <path d="M604 335L574 347L580 388L607 377Z" />
            </g>
            <g data-zone="lower_back" data-label="Schiena bassa" className={isSel("lower_back")}>
                <title>Schiena bassa</title>
                <path d="M450 406L491 394L491 489L457 500Q438 483 450 406Z" />
                <path d="M533 394L574 406Q586 483 567 500L533 489Z" />
            </g>
            <g data-zone="glute_l" data-label="Gluteo sinistro" className={isSel("glute_l")}>
                <title>Gluteo sinistro</title>
                <path d="M438 536L491 512L491 607L451 618Q426 595 438 536Z" />
            </g>
            <g data-zone="glute_r" data-label="Gluteo destro" className={isSel("glute_r")}>
                <title>Gluteo destro</title>
                <path d="M533 512L586 536Q598 595 573 618L533 607Z" />
            </g>
            <g data-zone="back_arm_l" data-label="Braccio sinistro (retro)" className={isSel("back_arm_l")}>
                <title>Braccio sinistro (retro)</title>
                <rect x="317" y="353" width="65" height="124" rx="26" />
                <rect x="310" y="500" width="65" height="183" rx="26" />
                <rect x="277" y="668" width="72" height="110" rx="20" />
            </g>
            <g data-zone="back_arm_r" data-label="Braccio destro (retro)" className={isSel("back_arm_r")}>
                <title>Braccio destro (retro)</title>
                <rect x="642" y="353" width="65" height="124" rx="26" />
                <rect x="649" y="500" width="65" height="183" rx="26" />
                <rect x="676" y="668" width="72" height="110" rx="20" />
            </g>
            <g data-zone="back_leg_l" data-label="Gamba sinistra (retro)" className={isSel("back_leg_l")}>
                <title>Gamba sinistra (retro)</title>
                <rect x="432" y="630" width="83" height="130" rx="30" />
                <rect x="444" y="760" width="65" height="47" rx="15" />
                <rect x="438" y="807" width="71" height="100" rx="32" />
                <rect x="448" y="908" width="53" height="21" rx="8" />
                <path d="M432 928L497 928L509 942Q479 951 438 943Z" />
            </g>
            <g data-zone="back_leg_r" data-label="Gamba destra (retro)" className={isSel("back_leg_r")}>
                <title>Gamba destra (retro)</title>
                <rect x="510" y="630" width="83" height="130" rx="30" />
                <rect x="515" y="760" width="65" height="47" rx="15" />
                <rect x="515" y="807" width="71" height="100" rx="32" />
                <rect x="523" y="908" width="53" height="21" rx="8" />
                <path d="M527 928L592 928L586 943Q545 951 515 942Z" />
            </g>

        </svg>
    )
}
