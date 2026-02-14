"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import { useWizardStore } from "@/lib/store/wizard-store"
import { cn } from "@/lib/utils"
import { User, Activity, Move, Bug, X, Settings2, Maximize2, MousePointer2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import BodyFront from "./body-chart/BodyFront"
import BodyBack from "./body-chart/BodyBack"

// --- TYPES ---
type ViewMode = 'front' | 'back'
type OffsetMap = Record<string, { x: number, y: number, sx: number, sy: number, r: number }>

const DEFAULT_OFFSET = { x: 0, y: 0, sx: 1, sy: 1, r: 0 }

const INITIAL_OFFSETS: OffsetMap = {
    // --- USER PROVIDED (LEFT) ---
    "arm_upper_l": { "x": 14, "y": -14, "sx": 0.61, "sy": 0.76, "r": 9 },
    "elbow_l": { "x": -14, "y": -48, "sx": 0.6, "sy": 0.78, "r": 9 },
    "forearm_l": { "x": -34, "y": -77, "sx": 0.61, "sy": 0.71, "r": 7 },
    "hand_l": { "x": -67, "y": -182, "sx": 0.56, "sy": 0.5, "r": 12 },
    "thigh_l": { "x": -5, "y": 129, "sx": 1, "sy": 1.5, "r": 0 },
    "foot_l": { "x": -24, "y": 311, "sx": 1, "sy": 1, "r": 15 },
    "shin_l": { "x": -5, "y": 263, "sx": 1, "sy": 1.28, "r": 0 },
    "knee_l": { "x": -10, "y": 210, "sx": 1, "sy": 1.16, "r": 0 },
    "chest_l": { "x": 0, "y": 0, "sx": 1, "sy": 1, "r": 0 },
    "chest_r": { "x": 0, "y": 0, "sx": 1, "sy": 1, "r": 0 },
    "head_neck": { "x": 0, "y": -76, "sx": 0.77, "sy": 0.82, "r": 0 },

    // --- AUTO-GENERATED SYMMETRY (RIGHT) ---
    // X is inverted, Rotation is inverted
    "arm_upper_r": { "x": -14, "y": -14, "sx": 0.61, "sy": 0.76, "r": -9 },
    "elbow_r": { "x": 14, "y": -48, "sx": 0.6, "sy": 0.78, "r": -9 },
    "forearm_r": { "x": 34, "y": -77, "sx": 0.61, "sy": 0.71, "r": -7 },
    "hand_r": { "x": 67, "y": -182, "sx": 0.56, "sy": 0.5, "r": -12 },
    "thigh_r": { "x": 5, "y": 129, "sx": 1, "sy": 1.5, "r": 0 },
    "foot_r": { "x": 24, "y": 311, "sx": 1, "sy": 1, "r": -15 },
    "shin_r": { "x": 5, "y": 263, "sx": 1, "sy": 1.28, "r": 0 },
    "knee_r": { "x": 10, "y": 210, "sx": 1, "sy": 1.16, "r": 0 },
}

export default function BodyChart() {
    const { bodyParts, setField } = useWizardStore()
    const [view, setView] = useState<ViewMode>('front')
    const [debug, setDebug] = useState(false)
    const [calibrationMode, setCalibrationMode] = useState(false)
    const [offsets, setOffsets] = useState<OffsetMap>(INITIAL_OFFSETS)
    const [activeZone, setActiveZone] = useState<string | null>(null)

    // Drag State
    const [draggedZone, setDraggedZone] = useState<string | null>(null)
    const dragStartPos = useRef<{ x: number, y: number } | null>(null)
    const dragStartOffset = useRef<{ x: number, y: number } | null>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    const maxSelections = 3
    const selectedIds = useMemo(() => new Set(bodyParts.map(p => p.id)), [bodyParts])

    // --- CLICK HANDLER (Selection) ---
    const handleZoneToggle = (zoneId: string, label: string) => {
        if (calibrationMode) {
            setActiveZone(zoneId)
            return
        }

        const current = new Set(selectedIds)
        if (current.has(zoneId)) {
            const newParts = bodyParts.filter(p => p.id !== zoneId)
            setField("bodyParts", newParts)
        } else {
            if (current.size >= maxSelections) {
                alert(`Massimo ${maxSelections} aree selezionabili.`)
                return
            }
            const newPart = { id: zoneId, label: label, view: view }
            setField("bodyParts", [...bodyParts, newPart])
        }
    }

    const handleClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.calibration-sidebar')) return

        const target = (e.target as HTMLElement).closest("g[data-zone]") as HTMLElement | null
        if (!target) {
            if (calibrationMode && !draggedZone) setActiveZone(null)
            return
        }

        const zoneId = target.getAttribute('data-zone')
        const label = target.getAttribute('data-label') || zoneId

        if (zoneId) {
            handleZoneToggle(zoneId, label!)
        }
    }

    // --- DRAG LOGIC ---
    useEffect(() => {
        if (!calibrationMode) return

        const handlePointerMove = (e: PointerEvent) => {
            if (!draggedZone || !dragStartPos.current || !dragStartOffset.current || !svgRef.current) return

            e.preventDefault()

            const point = svgRef.current.createSVGPoint()
            point.x = e.clientX
            point.y = e.clientY
            const svgPoint = point.matrixTransform(svgRef.current.getScreenCTM()?.inverse())

            const startPoint = svgRef.current.createSVGPoint()
            startPoint.x = dragStartPos.current.x
            startPoint.y = dragStartPos.current.y
            const startSvgPoint = startPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse())

            const dx = svgPoint.x - startSvgPoint.x
            const dy = svgPoint.y - startSvgPoint.y

            setOffsets(prev => {
                const current = prev[draggedZone] || { ...DEFAULT_OFFSET }
                return {
                    ...prev,
                    [draggedZone]: {
                        ...current,
                        x: Math.round(dragStartOffset.current!.x + dx),
                        y: Math.round(dragStartOffset.current!.y + dy)
                    }
                }
            })
        }

        const handlePointerUp = () => {
            setDraggedZone(null)
            dragStartPos.current = null
            dragStartOffset.current = null
        }

        window.addEventListener('pointermove', handlePointerMove)
        window.addEventListener('pointerup', handlePointerUp)

        return () => {
            window.removeEventListener('pointermove', handlePointerMove)
            window.removeEventListener('pointerup', handlePointerUp)
        }
    }, [calibrationMode, draggedZone])

    const startDrag = (e: React.PointerEvent, zoneId: string) => {
        if (!calibrationMode) return
        e.preventDefault()
        e.stopPropagation()

        setActiveZone(zoneId)
        const currentOffset = offsets[zoneId] || { ...DEFAULT_OFFSET }
        setDraggedZone(zoneId)
        dragStartPos.current = { x: e.clientX, y: e.clientY }
        dragStartOffset.current = { x: currentOffset.x, y: currentOffset.y }

        const target = e.currentTarget as Element
        if (target.setPointerCapture) {
            target.setPointerCapture(e.pointerId)
        }
    }

    const updateTransform = (prop: keyof typeof DEFAULT_OFFSET, val: number) => {
        if (!activeZone) return
        setOffsets(prev => {
            const current = prev[activeZone] || { ...DEFAULT_OFFSET }
            return {
                ...prev,
                [activeZone]: { ...current, [prop]: val }
            }
        })
    }

    const svgProps = {
        selectedIds,
        offsets,
        calibrationMode,
        activeZone,
        onPointerDown: startDrag
    }

    return (
        <div className={`w-full flex flex-col bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden transition-all duration-300 ${debug ? 'debug-mode' : ''} ${calibrationMode ? 'calibration-mode' : ''}`}>

            {/* --- HEADER --- */}
            <div className="w-full h-16 bg-white shrink-0 z-30 flex items-center justify-between px-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-full">
                        <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 tracking-tight">MAPPATURA CORPOREA</h3>
                        <p className="text-[10px] text-slate-400 font-medium tracking-wide">BIO-METRIC ANALYSIS</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="bg-slate-100 p-1 rounded-lg flex mr-4">
                        <button onClick={() => setView('front')} className={cn("px-4 py-1.5 rounded-md text-xs font-medium transition-all", view === 'front' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Frontale</button>
                        <button onClick={() => setView('back')} className={cn("px-4 py-1.5 rounded-md text-xs font-medium transition-all", view === 'back' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Dorsale</button>
                    </div>

                    <button
                        onClick={() => setCalibrationMode(!calibrationMode)}
                        className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shadow-sm", calibrationMode ? "bg-orange-50 border-orange-200 text-orange-600 ring-2 ring-orange-100" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}
                    >
                        <Settings2 className="w-3.5 h-3.5" />
                        {calibrationMode ? "CALIBRAZIONE" : "Calibra"}
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex flex-1 min-h-[600px] relative">

                {/* --- CANVAS --- */}
                <div className="flex-1 relative bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] flex justify-center p-8 overflow-hidden" onClick={handleClick}>
                    <style jsx global>{`
                        /* Base Styles */
                        .zone-group path, .zone-group ellipse, .zone-group rect { 
                            fill: transparent; 
                            transition: fill 0.2s, stroke 0.2s; 
                            cursor: pointer;
                        }
                        
                        /* Interactions */
                        .zone-group:hover path, .zone-group:hover ellipse, .zone-group:hover rect { 
                            fill: rgba(37, 99, 235, 0.08); 
                            stroke: rgba(37, 99, 235, 0.3);
                            stroke-width: 1px;
                        }

                        .zone-group.is-selected path, .zone-group.is-selected ellipse, .zone-group.is-selected rect { 
                            fill: rgba(37, 99, 235, 0.15) !important;
                            stroke: #2563eb !important;
                            stroke-width: 1.5px !important;
                        }
                        
                        /* Calibration Active */
                        .calibration-mode .zone-group { cursor: move !important; touch-action: none; }
                        .calibration-mode .zone-group path, .calibration-mode .zone-group ellipse, .calibration-mode .zone-group rect {
                            stroke: #f97316 !important; 
                            stroke-width: 1px !important;
                            fill: rgba(249, 115, 22, 0.05) !important;
                            stroke-dasharray: 4 2;
                        }
                        .calibration-mode .zone-group.active-zone path, .calibration-mode .zone-group.active-zone ellipse, .calibration-mode .zone-group.active-zone rect {
                            fill: rgba(249, 115, 22, 0.25) !important;
                            stroke: #ea580c !important;
                            stroke-width: 2px !important;
                            stroke-dasharray: none;
                        }
                    `}</style>

                    <div className="w-full max-w-[460px] relative">
                        <svg
                            ref={svgRef}
                            viewBox="0 0 1414 2048"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-full h-auto select-none drop-shadow-xl"
                        >
                            <image
                                href={view === 'front' ? "/assets/body-front.png" : "/assets/body-back.png"}
                                x="0" y="0" width="1414" height="2048"
                                className="pointer-events-none"
                            />
                            {view === 'front' ? <BodyFront {...svgProps} /> : <BodyBack {...svgProps} />}
                        </svg>
                    </div>

                    {!calibrationMode && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                            <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-full shadow-lg px-2 py-2 flex items-center gap-2 max-w-[90vw] overflow-x-auto no-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {bodyParts.length === 0 ? (
                                        <span className="text-xs text-slate-400 font-medium px-4 py-1 flex items-center gap-2">
                                            <Activity className="w-3.5 h-3.5" />
                                            Seleziona le aree interessate
                                        </span>
                                    ) : (
                                        bodyParts.map((p) => (
                                            <motion.div
                                                layout
                                                initial={{ scale: 0.8, opacity: 0, width: 0 }}
                                                animate={{ scale: 1, opacity: 1, width: "auto" }}
                                                exit={{ scale: 0.8, opacity: 0, width: 0 }}
                                                key={p.id}
                                                className="flex items-center gap-2 bg-blue-50 pl-3 pr-2 py-1.5 rounded-full border border-blue-100 shadow-sm whitespace-nowrap"
                                            >
                                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">{p.label}</span>
                                                <button onClick={() => handleZoneToggle(p.id, "")} className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-colors">
                                                    <X className="w-2.5 h-2.5" />
                                                </button>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- SIDEBAR CALIBRATION PANEL --- */}
                <AnimatePresence>
                    {calibrationMode && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="bg-white border-l border-slate-200 shadow-xl z-40 overflow-hidden flex flex-col calibration-sidebar"
                        >
                            <div className="p-4 border-b border-orange-50 bg-orange-50/30">
                                <h4 className="text-orange-600 text-sm font-bold flex items-center gap-2">
                                    <Move className="w-4 h-4" /> CALIBRAZIONE
                                </h4>
                                <p className="text-[10px] text-orange-400 mt-1">
                                    Trascina per spostare, usa i controlli per modificare.
                                </p>
                            </div>

                            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                {activeZone ? (
                                    <div className="bg-white border-2 border-orange-100 rounded-xl p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                                            <span className="text-xs font-bold text-slate-700 uppercase">{activeZone}</span>
                                            <button onClick={() => setActiveZone(null)} className="text-slate-400 hover:text-red-500">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-5">
                                            {/* Scale X */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-medium text-slate-500">
                                                    <span>LARGHEZZA (Width)</span>
                                                    <span>{(offsets[activeZone]?.sx ?? 1).toFixed(2)}x</span>
                                                </div>
                                                <input
                                                    type="range" min="0.5" max="1.5" step="0.01"
                                                    value={offsets[activeZone]?.sx ?? 1}
                                                    onChange={(e) => updateTransform('sx', parseFloat(e.target.value))}
                                                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                                />
                                            </div>

                                            {/* Scale Y */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-medium text-slate-500">
                                                    <span>ALTEZZA (Height)</span>
                                                    <span>{(offsets[activeZone]?.sy ?? 1).toFixed(2)}x</span>
                                                </div>
                                                <input
                                                    type="range" min="0.5" max="1.5" step="0.01"
                                                    value={offsets[activeZone]?.sy ?? 1}
                                                    onChange={(e) => updateTransform('sy', parseFloat(e.target.value))}
                                                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                                />
                                            </div>

                                            {/* Rotation */}
                                            <div className="space-y-2 pt-2 border-t border-slate-50">
                                                <div className="flex justify-between text-[10px] font-medium text-slate-500">
                                                    <span>ROTAZIONE (Gradi)</span>
                                                    <span>{(offsets[activeZone]?.r ?? 0)}°</span>
                                                </div>
                                                <input
                                                    type="range" min="-45" max="45" step="1"
                                                    value={offsets[activeZone]?.r ?? 0}
                                                    onChange={(e) => updateTransform('r', parseFloat(e.target.value))}
                                                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                                />
                                            </div>

                                            <div className="pt-2 grid grid-cols-3 gap-2">
                                                <button onClick={() => updateTransform('sx', 1)} className="px-2 py-1.5 text-[9px] font-medium bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 text-slate-600">Reset W</button>
                                                <button onClick={() => updateTransform('sy', 1)} className="px-2 py-1.5 text-[9px] font-medium bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 text-slate-600">Reset H</button>
                                                <button onClick={() => updateTransform('r', 0)} className="px-2 py-1.5 text-[9px] font-medium bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 text-slate-600">Reset R</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                        <MousePointer2 className="w-8 h-8 text-slate-300 mb-2" />
                                        <p className="text-xs text-slate-400 font-medium">Seleziona una zona<br />per modificarla</p>
                                    </div>
                                )}

                                <div className="mt-6">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">JSON COMPLETO</label>
                                    <div className="relative group">
                                        <textarea
                                            readOnly
                                            className="w-full h-40 bg-slate-900 text-green-400 text-[10px] font-mono p-3 rounded-lg border border-slate-800 resize-none focus:outline-none"
                                            value={JSON.stringify(offsets, null, 2)}
                                        />
                                        <button
                                            onClick={() => navigator.clipboard.writeText(JSON.stringify(offsets, null, 2))}
                                            className="absolute top-2 right-2 bg-white/10 backdrop-blur border border-white/20 text-[10px] px-2 py-1 rounded text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            COPIA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
