
"use client"

import { BodyPart } from "@/lib/store/wizard-store"
import { cn } from "@/lib/utils"

interface BodyBackProps {
    bodyParts: BodyPart[]
    togglePart: (id: string, label: string) => void
    view: 'back'
}

export default function BodyBack({ bodyParts, togglePart, view }: BodyBackProps) {

    // MAP: Detailed Zone ID -> Logical Group ID
    // Maps detailed SVG paths to broader categories
    const ZONE_GROUPS: Record<string, { id: string, label: string }> = {
        // Head / Neck
        back_head: { id: 'back_head', label: 'Testa (retro)' },
        back_neck: { id: 'back_neck', label: 'Collo (retro)' },

        // Upper Back (Upper + Scapula)
        upper_back_l: { id: 'upper_back_l', label: 'Schiena alta sinistra' },
        scapula_l: { id: 'upper_back_l', label: 'Schiena alta sinistra' },
        upper_back_r: { id: 'upper_back_r', label: 'Schiena alta destra' },
        scapula_r: { id: 'upper_back_r', label: 'Schiena alta destra' },

        // Lower Back
        lower_back_l: { id: 'lower_back_l', label: 'Schiena bassa sinistra' },
        lower_back_r: { id: 'lower_back_r', label: 'Schiena bassa destra' },

        // Glutes
        glute_l: { id: 'glute_l', label: 'Gluteo sinistro' },
        glute_r: { id: 'glute_r', label: 'Gluteo destro' },

        // Arms (Back View) -> Grouping full arm?
        // Front view has upper/forearm/hand. Let's match front view granularity or simple?
        // User asked for "thighs, chest..." not explicitly arms.
        // Let's keep Arm Upper, Forearm, Hand separate to match front view logic.
        back_upperarm_l: { id: 'back_arm_l', label: 'Braccio sinistro (retro)' },
        back_upperarm_r: { id: 'back_arm_r', label: 'Braccio destro (retro)' },

        back_forearm_l: { id: 'back_forearm_l', label: 'Avambraccio sinistro (retro)' },
        back_forearm_r: { id: 'back_forearm_r', label: 'Avambraccio destro (retro)' },

        back_hand_l: { id: 'back_hand_l', label: 'Mano sinistra (retro)' },
        back_hand_r: { id: 'back_hand_r', label: 'Mano destra (retro)' },

        // Thigh Back
        thigh_back_l: { id: 'thigh_back_l', label: 'Coscia posteriore sinistra' },
        thigh_back_r: { id: 'thigh_back_r', label: 'Coscia posteriore destra' },

        // Knee Back
        knee_back_l: { id: 'knee_back_l', label: 'Ginocchio (retro) sinistro' },
        knee_back_r: { id: 'knee_back_r', label: 'Ginocchio (retro) destro' },

        // Calf Back
        calf_back_l: { id: 'leg_back_l', label: 'Polpaccio sinistro' },
        calf_back_r: { id: 'leg_back_r', label: 'Polpaccio destro' },

        // Ankles / Feet Back
        back_ankle_l: { id: 'back_foot_l', label: 'Piede sinistro (retro)' },
        back_foot_l: { id: 'back_foot_l', label: 'Piede sinistro (retro)' },
        back_ankle_r: { id: 'back_foot_r', label: 'Piede destro (retro)' },
        back_foot_r: { id: 'back_foot_r', label: 'Piede destro (retro)' },
    }

    // CONFIGURATION: Calibrated Transforms for Body Parts (Back View)
    // Applying Global Logic: Scale 0.59, Y -157px, X +/-70px (Arms), X +/-20px (Torso/Legs)
    const getZoneTransform = (zoneId: string) => {
        const centerOrigin = { transformOrigin: "512px 682.5px" }
        const scale = "scale(0.59)"
        const yOffset = "-157px"

        const torsoAndLegs = [
            'upper_back', 'scapula', 'lower_back', 'glute',
            'thigh', 'knee', 'leg', 'calf', 'ankle', 'foot'
        ]
        const isTorsoOrLeg = torsoAndLegs.some(part => zoneId.includes(part))

        // 1. CENTER (Head/Neck)
        if (['back_head', 'back_neck'].includes(zoneId)) {
            return { transform: `translate(0px, ${yOffset}) ${scale}`, ...centerOrigin }
        }

        // 2. LEFT SIDE (SVG Coords Left of Center < 512)
        // In Back View, this is "Left" of the image.
        if (zoneId.endsWith('_l')) {
            // Torso/Legs: Closer to center
            if (isTorsoOrLeg) {
                return { transform: `translate(-20px, ${yOffset}) ${scale}`, ...centerOrigin }
            }

            // Overrides for arms
            if (['back_forearm_l'].includes(zoneId)) return { transform: "translate(-77px, -175px) scale(0.59)", ...centerOrigin }
            if (['back_hand_l'].includes(zoneId)) return { transform: "translate(-113px, -200px) scale(0.55)", ...centerOrigin }

            return { transform: `translate(-70px, ${yOffset}) ${scale}`, ...centerOrigin }
        }

        if (zoneId.endsWith('_r')) {
            // Torso/Legs: Closer to center
            if (isTorsoOrLeg) {
                return { transform: `translate(20px, ${yOffset}) ${scale}`, ...centerOrigin }
            }

            // Overrides for arms
            if (['back_forearm_r'].includes(zoneId)) return { transform: "translate(77px, -175px) scale(0.59)", ...centerOrigin }
            if (['back_hand_r'].includes(zoneId)) return { transform: "translate(113px, -200px) scale(0.55)", ...centerOrigin }

            return { transform: `translate(70px, ${yOffset}) ${scale}`, ...centerOrigin }
        }

        return {}
    }

    const handleZoneClick = (e: React.MouseEvent<SVGGElement>) => {
        const target = (e.target as Element).closest('.zone') as HTMLElement | null
        if (!target) return

        const detailedZone = target.getAttribute('data-zone')

        if (detailedZone) {
            // Lookup the Logical Group
            const group = ZONE_GROUPS[detailedZone]
            if (group) {
                togglePart(group.id, group.label)
            } else {
                const label = target.getAttribute('data-label') || detailedZone
                togglePart(detailedZone, label)
            }
        }
    }

    const isSelected = (detailedZone: string) => {
        const group = ZONE_GROUPS[detailedZone]
        if (!group) return false
        return bodyParts.some(p => p.id === `${group.id}_back`)
    }

    return (
        <div className="flex flex-col gap-4">
            <svg
                viewBox="0 0 1024 1365"
                className="w-full h-auto max-h-[500px] select-none border border-slate-800 rounded-lg bg-slate-950"
                role="img"
                aria-label="Body chart back selectable zones"
            >
                <defs>
                    <filter id="glow-back" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <style>{`
                    .zone {
                        fill: #22d3ee; 
                        fill-opacity: 0; 
                        cursor: pointer; 
                        transition: all 0.2s ease;
                        pointer-events: all;
                        stroke: transparent;
                        stroke-width: 2px;
                    }
                    .zone:hover {
                        fill-opacity: 0.2;
                        filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.5));
                    }
                    .zone.is-selected {
                        fill-opacity: 0.4;
                        stroke: #67e8f9;
                        filter: url(#glow-back);
                    }
                `}</style>

                {/* BASE IMAGE */}
                <image
                    href="/assets/body-back.png"
                    x="0" y="0"
                    width="1024" height="1365"
                    preserveAspectRatio="xMidYMid meet"
                    opacity="1"
                />

                <g id="zones-back" onClick={handleZoneClick}>
                    {/* Head / Neck */}
                    <ellipse className={cn("zone", isSelected("back_head") && "is-selected")} style={getZoneTransform("back_head")} data-zone="back_head" cx="512" cy="165" rx="80" ry="95"><title>Testa (retro)</title></ellipse>
                    <rect className={cn("zone", isSelected("back_neck") && "is-selected")} style={getZoneTransform("back_neck")} data-zone="back_neck" x="480" y="255" width="64" height="75" rx="26"><title>Collo (retro)</title></rect>

                    {/* Upper back L/R */}
                    <path className={cn("zone", isSelected("upper_back_l") && "is-selected")} style={getZoneTransform("upper_back_l")} data-zone="upper_back_l" d="M420 335 L510 335 L510 460 L440 480 Q400 450 420 335 Z"><title>Schiena alta sinistra</title></path>
                    <path className={cn("zone", isSelected("upper_back_r") && "is-selected")} style={getZoneTransform("upper_back_r")} data-zone="upper_back_r" d="M514 335 L604 335 Q624 450 584 480 L514 460 Z"><title>Schiena alta destra</title></path>

                    {/* Scapula L/R */}
                    <path className={cn("zone", isSelected("scapula_l") && "is-selected")} style={getZoneTransform("scapula_l")} data-zone="scapula_l" d="M390 360 L440 380 L430 450 L385 430 Z"><title>Scapola sinistra</title></path>
                    <path className={cn("zone", isSelected("scapula_r") && "is-selected")} style={getZoneTransform("scapula_r")} data-zone="scapula_r" d="M634 360 L584 380 L594 450 L639 430 Z"><title>Scapola destra</title></path>

                    {/* Lower back L/R */}
                    <path className={cn("zone", isSelected("lower_back_l") && "is-selected")} style={getZoneTransform("lower_back_l")} data-zone="lower_back_l" d="M440 480 L510 460 L510 620 L452 640 Q420 610 440 480 Z"><title>Schiena bassa sinistra</title></path>
                    <path className={cn("zone", isSelected("lower_back_r") && "is-selected")} style={getZoneTransform("lower_back_r")} data-zone="lower_back_r" d="M514 460 L584 480 Q604 610 572 640 L514 620 Z"><title>Schiena bassa destra</title></path>

                    {/* Glutes L/R */}
                    <path className={cn("zone", isSelected("glute_l") && "is-selected")} style={getZoneTransform("glute_l")} data-zone="glute_l" d="M420 700 L510 660 L510 820 L442 840 Q400 800 420 700 Z"><title>Gluteo sinistro</title></path>
                    <path className={cn("zone", isSelected("glute_r") && "is-selected")} style={getZoneTransform("glute_r")} data-zone="glute_r" d="M514 660 L604 700 Q624 800 582 840 L514 820 Z"><title>Gluteo destro</title></path>

                    {/* Arms (macro back) */}
                    <rect className={cn("zone", isSelected("back_upperarm_l") && "is-selected")} style={getZoneTransform("back_upperarm_l")} data-zone="back_upperarm_l" x="300" y="390" width="110" height="210" rx="44" />
                    <rect className={cn("zone", isSelected("back_upperarm_r") && "is-selected")} style={getZoneTransform("back_upperarm_r")} data-zone="back_upperarm_r" x="614" y="390" width="110" height="210" rx="44" />
                    <rect className={cn("zone", isSelected("back_forearm_l") && "is-selected")} style={getZoneTransform("back_forearm_l")} data-zone="back_forearm_l" x="300" y="670" width="110" height="310" rx="44" />
                    <rect className={cn("zone", isSelected("back_forearm_r") && "is-selected")} style={getZoneTransform("back_forearm_r")} data-zone="back_forearm_r" x="614" y="670" width="110" height="310" rx="44" />
                    <rect className={cn("zone", isSelected("back_hand_l") && "is-selected")} style={getZoneTransform("back_hand_l")} data-zone="back_hand_l" x="290" y="1020" width="130" height="200" rx="36" />
                    <rect className={cn("zone", isSelected("back_hand_r") && "is-selected")} style={getZoneTransform("back_hand_r")} data-zone="back_hand_r" x="604" y="1020" width="130" height="200" rx="36" />

                    {/* Thigh back L/R */}
                    <rect className={cn("zone", isSelected("thigh_back_l") && "is-selected")} style={getZoneTransform("thigh_back_l")} data-zone="thigh_back_l" x="410" y="860" width="140" height="220" rx="50" />
                    <rect className={cn("zone", isSelected("thigh_back_r") && "is-selected")} style={getZoneTransform("thigh_back_r")} data-zone="thigh_back_r" x="474" y="860" width="140" height="220" rx="50" />

                    {/* Knees */}
                    <rect className={cn("zone", isSelected("knee_back_l") && "is-selected")} style={getZoneTransform("knee_back_l")} data-zone="knee_back_l" x="430" y="1080" width="110" height="80" rx="26" />
                    <rect className={cn("zone", isSelected("knee_back_r") && "is-selected")} style={getZoneTransform("knee_back_r")} data-zone="knee_back_r" x="484" y="1080" width="110" height="80" rx="26" />

                    {/* Calves */}
                    <rect className={cn("zone", isSelected("calf_back_l") && "is-selected")} style={getZoneTransform("calf_back_l")} data-zone="calf_back_l" x="420" y="1160" width="120" height="170" rx="55" />
                    <rect className={cn("zone", isSelected("calf_back_r") && "is-selected")} style={getZoneTransform("calf_back_r")} data-zone="calf_back_r" x="484" y="1160" width="120" height="170" rx="55" />

                    {/* Ankles + feet */}
                    <rect className={cn("zone", isSelected("back_ankle_l") && "is-selected")} style={getZoneTransform("back_ankle_l")} data-zone="back_ankle_l" x="438" y="1330" width="90" height="35" rx="14" />
                    <rect className={cn("zone", isSelected("back_ankle_r") && "is-selected")} style={getZoneTransform("back_ankle_r")} data-zone="back_ankle_r" x="496" y="1330" width="90" height="35" rx="14" />
                    <path className={cn("zone", isSelected("back_foot_l") && "is-selected")} style={getZoneTransform("back_foot_l")} data-zone="back_foot_l" d="M410 1365 L520 1365 L540 1388 Q490 1404 420 1390 Z" />
                    <path className={cn("zone", isSelected("back_foot_r") && "is-selected")} style={getZoneTransform("back_foot_r")} data-zone="back_foot_r" d="M504 1365 L614 1365 L604 1390 Q534 1404 484 1388 Z" />
                </g>
            </svg>
        </div>
    )
}
