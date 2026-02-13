
"use client"

import { BodyPart } from "@/lib/store/wizard-store"
import { cn } from "@/lib/utils"

interface BodyFrontProps {
    bodyParts: BodyPart[]
    togglePart: (id: string, label: string) => void
    view: 'front'
}

export default function BodyFront({ bodyParts, togglePart, view }: BodyFrontProps) {

    // MAP: Detailed Zone ID -> Logical Group ID
    // This allows us to have detailed SVG paths (that fit the body perfectly)
    // but treat them as a single logical zone for selection.
    const ZONE_GROUPS: Record<string, { id: string, label: string }> = {
        // Head Group
        head: { id: 'head', label: 'Testa/Viso' },
        face: { id: 'head', label: 'Testa/Viso' },
        neck: { id: 'neck', label: 'Collo' },

        // Shoulder
        shoulder_l: { id: 'shoulder_l', label: 'Spalla sinistra' },
        shoulder_r: { id: 'shoulder_r', label: 'Spalla destra' },

        // Arm (Upper + Elbow)
        upperarm_l: { id: 'arm_l', label: 'Braccio sinistro' },
        elbow_l: { id: 'arm_l', label: 'Braccio sinistro' },
        upperarm_r: { id: 'arm_r', label: 'Braccio destro' },
        elbow_r: { id: 'arm_r', label: 'Braccio destro' },

        // Forearm
        forearm_upper_l: { id: 'forearm_l', label: 'Avambraccio sinistro' },
        forearm_lower_l: { id: 'forearm_l', label: 'Avambraccio sinistro' },
        forearm_upper_r: { id: 'forearm_r', label: 'Avambraccio destro' },
        forearm_lower_r: { id: 'forearm_r', label: 'Avambraccio destro' },

        // Hand (Wrist + Hand + Fingers)
        wrist_l: { id: 'hand_l', label: 'Mano sinistra' },
        hand_l: { id: 'hand_l', label: 'Mano sinistra' },
        fingers_l: { id: 'hand_l', label: 'Mano sinistra' },
        wrist_r: { id: 'hand_r', label: 'Mano destra' },
        hand_r: { id: 'hand_r', label: 'Mano destra' },
        fingers_r: { id: 'hand_r', label: 'Mano destra' },

        // Chest (Upper + Mid + Ribs)
        chest_upper_l: { id: 'chest_l', label: 'Torace sinistro' },
        chest_mid_l: { id: 'chest_l', label: 'Torace sinistro' },
        ribs_l: { id: 'chest_l', label: 'Torace sinistro' },
        chest_upper_r: { id: 'chest_r', label: 'Torace destro' },
        chest_mid_r: { id: 'chest_r', label: 'Torace destro' },
        ribs_r: { id: 'chest_r', label: 'Torace destro' },

        // Abdomen (Upper + Lower)
        abdomen_upper_l: { id: 'abdomen_l', label: 'Addome sinistro' },
        abdomen_lower_l: { id: 'abdomen_l', label: 'Addome sinistro' },
        abdomen_upper_r: { id: 'abdomen_r', label: 'Addome destro' },
        abdomen_lower_r: { id: 'abdomen_r', label: 'Addome destro' },

        // Pelvis (Pelvis + Hips)
        pelvis_l: { id: 'pelvis_l', label: 'Bacino sinistro' },
        hip_l: { id: 'pelvis_l', label: 'Bacino sinistro' },
        pelvis_r: { id: 'pelvis_r', label: 'Bacino destro' },
        hip_r: { id: 'pelvis_r', label: 'Bacino destro' },

        // Groin
        groin: { id: 'groin', label: 'Inguine' },

        // Thigh (Inner + Outer)
        thigh_inner_l: { id: 'thigh_l', label: 'Coscia sinistra' },
        thigh_outer_l: { id: 'thigh_l', label: 'Coscia sinistra' },
        thigh_inner_r: { id: 'thigh_r', label: 'Coscia destra' },
        thigh_outer_r: { id: 'thigh_r', label: 'Coscia destra' },

        // Knee
        knee_l: { id: 'knee_l', label: 'Ginocchio sinistro' },
        knee_r: { id: 'knee_r', label: 'Ginocchio destro' },

        // Lower Leg (Shin + Calf)
        shin_l: { id: 'leg_l', label: 'Gamba sinistra' },
        calf_l: { id: 'leg_l', label: 'Gamba sinistra' },
        shin_r: { id: 'leg_r', label: 'Gamba destra' },
        calf_r: { id: 'leg_r', label: 'Gamba destra' },

        // Foot (Ankle + Foot + Toes)
        ankle_l: { id: 'foot_l', label: 'Piede sinistro' },
        foot_l: { id: 'foot_l', label: 'Piede sinistro' },
        toes_l: { id: 'foot_l', label: 'Piede sinistro' },
        ankle_r: { id: 'foot_r', label: 'Piede destro' },
        foot_r: { id: 'foot_r', label: 'Piede destro' },
        toes_r: { id: 'foot_r', label: 'Piede destro' },
    }

    // CONFIGURATION: Calibrated Transforms for Body Parts
    // Based on User Calibration: Scale 0.59, Global Y Offset -157px
    // X Offsets strategy:
    // - Arms: +/- 70px (to match user calibration)
    // - Torso/Legs: +/- 20px (to keep them closer as requested)
    const getZoneTransform = (zoneId: string) => {
        const centerOrigin = { transformOrigin: "512px 682.5px" }
        const scale = "scale(0.59)"
        const yOffset = "-157px"

        const torsoAndLegs = [
            'shoulder', 'chest', 'ribs', 'abdomen', 'pelvis', 'hip', 'groin',
            'thigh', 'knee', 'shin', 'calf', 'ankle', 'foot', 'toes'
        ]

        const isTorsoOrLeg = torsoAndLegs.some(part => zoneId.includes(part))

        // 1. CENTER COLUMN (Head, Neck, Groin - explicit center)
        if (['head', 'face', 'neck', 'groin'].includes(zoneId)) {
            return { transform: `translate(0px, ${yOffset}) ${scale}`, ...centerOrigin }
        }

        // 2. LEFT SIDE
        if (zoneId.endsWith('_l')) {
            // Torso/Legs: Closer to center
            if (isTorsoOrLeg) {
                return { transform: `translate(-20px, ${yOffset}) ${scale}`, ...centerOrigin }
            }

            // Arms (Default wide)
            // Specific overrides for Lower Arm/Hand if needed
            if (['forearm_lower_l'].includes(zoneId)) return { transform: "translate(-84px, -193px) scale(0.59)", ...centerOrigin }
            if (['wrist_l'].includes(zoneId)) return { transform: "translate(-96px, -200px) scale(0.59)", ...centerOrigin }
            if (['hand_l', 'fingers_l'].includes(zoneId)) return { transform: "translate(-113px, -200px) scale(0.55)", ...centerOrigin }

            return { transform: `translate(-70px, ${yOffset}) ${scale}`, ...centerOrigin }
        }

        // 3. RIGHT SIDE
        if (zoneId.endsWith('_r')) {
            // Torso/Legs: Closer to center
            if (isTorsoOrLeg) {
                return { transform: `translate(20px, ${yOffset}) ${scale}`, ...centerOrigin }
            }

            // Arms (Default wide)
            // Mirrored overrides
            if (['forearm_lower_r'].includes(zoneId)) return { transform: "translate(84px, -193px) scale(0.59)", ...centerOrigin }
            if (['wrist_r'].includes(zoneId)) return { transform: "translate(96px, -200px) scale(0.59)", ...centerOrigin }
            if (['hand_r', 'fingers_r'].includes(zoneId)) return { transform: "translate(113px, -200px) scale(0.55)", ...centerOrigin }

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
                // Fallback if not found in map (shouldn't happen if all mapped)
                const label = target.getAttribute('data-label') || detailedZone
                togglePart(detailedZone, label)
            }
        }
    }

    // Check if the Logic Group is selected
    const isSelected = (detailedZone: string) => {
        const group = ZONE_GROUPS[detailedZone]
        if (!group) return false
        return bodyParts.some(p => p.id === `${group.id}_front`)
    }

    return (
        <div className="flex flex-col gap-4">
            <svg
                viewBox="0 0 1024 1365"
                className="w-full h-auto max-h-[500px] select-none border border-slate-800 rounded-lg bg-slate-950"
                role="img"
                aria-label="Body chart front with 50 selectable zones"
            >
                <defs>
                    <filter id="glow-front" x="-20%" y="-20%" width="140%" height="140%">
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
                        filter: url(#glow-front);
                    }
                `}</style>

                {/* BASE IMAGE */}
                <image
                    href="/assets/body-front.png"
                    x="0" y="0"
                    width="1024" height="1365"
                    preserveAspectRatio="xMidYMid meet"
                    opacity="1"
                />

                {/* ZONES GROUP - Reverted to DETAILED PATHS for better visual fit */}
                <g id="zones-front" onClick={handleZoneClick}>
                    {/* Head / Face / Neck */}
                    <ellipse className={cn("zone", isSelected("head") && "is-selected")} style={getZoneTransform("head")} data-zone="head" cx="512" cy="165" rx="80" ry="95"><title>Testa</title></ellipse>
                    <ellipse className={cn("zone", isSelected("face") && "is-selected")} style={getZoneTransform("face")} data-zone="face" cx="512" cy="145" rx="55" ry="60"><title>Viso</title></ellipse>
                    <rect className={cn("zone", isSelected("neck") && "is-selected")} style={getZoneTransform("neck")} data-zone="neck" x="480" y="255" width="64" height="75" rx="26"><title>Collo</title></rect>

                    {/* Shoulders */}
                    <rect className={cn("zone", isSelected("shoulder_l") && "is-selected")} style={getZoneTransform("shoulder_l")} data-zone="shoulder_l" x="330" y="315" width="110" height="75" rx="30"><title>Spalla sinistra</title></rect>
                    <rect className={cn("zone", isSelected("shoulder_r") && "is-selected")} style={getZoneTransform("shoulder_r")} data-zone="shoulder_r" x="584" y="315" width="110" height="75" rx="30"><title>Spalla destra</title></rect>

                    {/* Upper arms */}
                    <rect className={cn("zone", isSelected("upperarm_l") && "is-selected")} style={getZoneTransform("upperarm_l")} data-zone="upperarm_l" x="300" y="390" width="110" height="210" rx="44"><title>Braccio sinistro</title></rect>
                    <rect className={cn("zone", isSelected("upperarm_r") && "is-selected")} style={getZoneTransform("upperarm_r")} data-zone="upperarm_r" x="614" y="390" width="110" height="210" rx="44"><title>Braccio destro</title></rect>

                    {/* Elbows */}
                    <rect className={cn("zone", isSelected("elbow_l") && "is-selected")} style={getZoneTransform("elbow_l")} data-zone="elbow_l" x="300" y="600" width="110" height="70" rx="26"><title>Gomito sinistro</title></rect>
                    <rect className={cn("zone", isSelected("elbow_r") && "is-selected")} style={getZoneTransform("elbow_r")} data-zone="elbow_r" x="614" y="600" width="110" height="70" rx="26"><title>Gomito destro</title></rect>

                    {/* Forearms */}
                    <rect className={cn("zone", isSelected("forearm_upper_l") && "is-selected")} style={getZoneTransform("forearm_upper_l")} data-zone="forearm_upper_l" x="300" y="670" width="110" height="150" rx="44"><title>Avambraccio alto sinistro</title></rect>
                    <rect className={cn("zone", isSelected("forearm_upper_r") && "is-selected")} style={getZoneTransform("forearm_upper_r")} data-zone="forearm_upper_r" x="614" y="670" width="110" height="150" rx="44"><title>Avambraccio alto destro</title></rect>
                    <rect className={cn("zone", isSelected("forearm_lower_l") && "is-selected")} style={getZoneTransform("forearm_lower_l")} data-zone="forearm_lower_l" x="300" y="820" width="110" height="160" rx="44"><title>Avambraccio basso sinistro</title></rect>
                    <rect className={cn("zone", isSelected("forearm_lower_r") && "is-selected")} style={getZoneTransform("forearm_lower_r")} data-zone="forearm_lower_r" x="614" y="820" width="110" height="160" rx="44"><title>Avambraccio basso destro</title></rect>

                    {/* Wrists/Hands/Fingers */}
                    <rect className={cn("zone", isSelected("wrist_l") && "is-selected")} style={getZoneTransform("wrist_l")} data-zone="wrist_l" x="305" y="980" width="100" height="40" rx="16"><title>Polso sinistro</title></rect>
                    <rect className={cn("zone", isSelected("wrist_r") && "is-selected")} style={getZoneTransform("wrist_r")} data-zone="wrist_r" x="619" y="980" width="100" height="40" rx="16"><title>Polso destro</title></rect>
                    <rect className={cn("zone", isSelected("hand_l") && "is-selected")} style={getZoneTransform("hand_l")} data-zone="hand_l" x="290" y="1020" width="130" height="110" rx="36"><title>Mano sinistra</title></rect>
                    <rect className={cn("zone", isSelected("hand_r") && "is-selected")} style={getZoneTransform("hand_r")} data-zone="hand_r" x="604" y="1020" width="130" height="110" rx="36"><title>Mano destra</title></rect>
                    <rect className={cn("zone", isSelected("fingers_l") && "is-selected")} style={getZoneTransform("fingers_l")} data-zone="fingers_l" x="290" y="1130" width="130" height="90" rx="30"><title>Dita sinistra</title></rect>
                    <rect className={cn("zone", isSelected("fingers_r") && "is-selected")} style={getZoneTransform("fingers_r")} data-zone="fingers_r" x="604" y="1130" width="130" height="90" rx="30"><title>Dita destra</title></rect>

                    {/* Chest / Ribs */}
                    <path className={cn("zone", isSelected("chest_upper_l") && "is-selected")} style={getZoneTransform("chest_upper_l")} data-zone="chest_upper_l" d="M430 335 L510 335 L510 430 L442 450 Q410 420 430 335 Z"><title>Torace alto sinistro</title></path>
                    <path className={cn("zone", isSelected("chest_upper_r") && "is-selected")} style={getZoneTransform("chest_upper_r")} data-zone="chest_upper_r" d="M514 335 L594 335 Q614 420 582 450 L514 430 Z"><title>Torace alto destro</title></path>
                    <path className={cn("zone", isSelected("chest_mid_l") && "is-selected")} style={getZoneTransform("chest_mid_l")} data-zone="chest_mid_l" d="M442 450 L510 430 L510 520 L452 538 Q420 510 442 450 Z"><title>Torace medio sinistro</title></path>
                    <path className={cn("zone", isSelected("chest_mid_r") && "is-selected")} style={getZoneTransform("chest_mid_r")} data-zone="chest_mid_r" d="M514 430 L582 450 Q604 510 572 538 L514 520 Z"><title>Torace medio destro</title></path>
                    <path className={cn("zone", isSelected("ribs_l") && "is-selected")} style={getZoneTransform("ribs_l")} data-zone="ribs_l" d="M392 420 L442 450 Q420 510 452 538 L410 560 Q360 520 392 420 Z"><title>Costato sinistro</title></path>
                    <path className={cn("zone", isSelected("ribs_r") && "is-selected")} style={getZoneTransform("ribs_r")} data-zone="ribs_r" d="M632 420 L582 450 Q604 510 572 538 L614 560 Q664 520 632 420 Z"><title>Costato destro</title></path>

                    {/* Abdomen */}
                    <path className={cn("zone", isSelected("abdomen_upper_l") && "is-selected")} style={getZoneTransform("abdomen_upper_l")} data-zone="abdomen_upper_l" d="M452 538 L510 520 L510 610 L460 628 Q430 602 452 538 Z"><title>Addome alto sinistro</title></path>
                    <path className={cn("zone", isSelected("abdomen_upper_r") && "is-selected")} style={getZoneTransform("abdomen_upper_r")} data-zone="abdomen_upper_r" d="M514 520 L572 538 Q594 602 564 628 L514 610 Z"><title>Addome alto destro</title></path>
                    <path className={cn("zone", isSelected("abdomen_lower_l") && "is-selected")} style={getZoneTransform("abdomen_lower_l")} data-zone="abdomen_lower_l" d="M460 628 L510 610 L510 700 L468 718 Q440 694 460 628 Z"><title>Addome basso sinistro</title></path>
                    <path className={cn("zone", isSelected("abdomen_lower_r") && "is-selected")} style={getZoneTransform("abdomen_lower_r")} data-zone="abdomen_lower_r" d="M514 610 L564 628 Q584 694 556 718 L514 700 Z"><title>Addome basso destro</title></path>

                    {/* Pelvis / Groin */}
                    <path className={cn("zone", isSelected("pelvis_l") && "is-selected")} style={getZoneTransform("pelvis_l")} data-zone="pelvis_l" d="M468 718 L510 700 L510 790 L478 805 Q448 780 468 718 Z"><title>Bacino sinistro</title></path>
                    <path className={cn("zone", isSelected("pelvis_r") && "is-selected")} style={getZoneTransform("pelvis_r")} data-zone="pelvis_r" d="M514 700 L556 718 Q576 780 546 805 L514 790 Z"><title>Bacino destro</title></path>
                    <path className={cn("zone", isSelected("groin") && "is-selected")} style={getZoneTransform("groin")} data-zone="groin" d="M478 805 L546 805 L562 840 Q512 900 462 840 Z"><title>Inguine</title></path>

                    {/* Hips */}
                    <path className={cn("zone", isSelected("hip_l") && "is-selected")} style={getZoneTransform("hip_l")} data-zone="hip_l" d="M430 760 L478 805 Q448 860 402 850 Q400 800 430 760 Z"><title>Anca sinistra</title></path>
                    <path className={cn("zone", isSelected("hip_r") && "is-selected")} style={getZoneTransform("hip_r")} data-zone="hip_r" d="M594 760 L546 805 Q576 860 622 850 Q624 800 594 760 Z"><title>Anca destra</title></path>

                    {/* Thighs */}
                    <rect className={cn("zone", isSelected("thigh_outer_l") && "is-selected")} style={getZoneTransform("thigh_outer_l")} data-zone="thigh_outer_l" x="410" y="860" width="80" height="220" rx="40"><title>Coscia esterna sinistra</title></rect>
                    <rect className={cn("zone", isSelected("thigh_inner_l") && "is-selected")} style={getZoneTransform("thigh_inner_l")} data-zone="thigh_inner_l" x="490" y="860" width="60" height="220" rx="30"><title>Coscia interna sinistra</title></rect>
                    <rect className={cn("zone", isSelected("thigh_inner_r") && "is-selected")} style={getZoneTransform("thigh_inner_r")} data-zone="thigh_inner_r" x="474" y="860" width="60" height="220" rx="30"><title>Coscia interna destra</title></rect>
                    <rect className={cn("zone", isSelected("thigh_outer_r") && "is-selected")} style={getZoneTransform("thigh_outer_r")} data-zone="thigh_outer_r" x="534" y="860" width="80" height="220" rx="40"><title>Coscia esterna destra</title></rect>

                    {/* Knees */}
                    <rect className={cn("zone", isSelected("knee_l") && "is-selected")} style={getZoneTransform("knee_l")} data-zone="knee_l" x="430" y="1080" width="110" height="80" rx="26"><title>Ginocchio sinistro</title></rect>
                    <rect className={cn("zone", isSelected("knee_r") && "is-selected")} style={getZoneTransform("knee_r")} data-zone="knee_r" x="484" y="1080" width="110" height="80" rx="26"><title>Ginocchio destro</title></rect>

                    {/* Lower legs */}
                    <rect className={cn("zone", isSelected("shin_l") && "is-selected")} style={getZoneTransform("shin_l")} data-zone="shin_l" x="438" y="1160" width="90" height="140" rx="40"><title>Tibia sinistra</title></rect>
                    <rect className={cn("zone", isSelected("calf_l") && "is-selected")} style={getZoneTransform("calf_l")} data-zone="calf_l" x="410" y="1160" width="28" height="140" rx="14"><title>Polpaccio sinistro</title></rect>
                    <rect className={cn("zone", isSelected("shin_r") && "is-selected")} style={getZoneTransform("shin_r")} data-zone="shin_r" x="496" y="1160" width="90" height="140" rx="40"><title>Tibia destra</title></rect>
                    <rect className={cn("zone", isSelected("calf_r") && "is-selected")} style={getZoneTransform("calf_r")} data-zone="calf_r" x="586" y="1160" width="28" height="140" rx="14"><title>Polpaccio destro</title></rect>

                    {/* Ankles / Feet */}
                    <rect className={cn("zone", isSelected("ankle_l") && "is-selected")} style={getZoneTransform("ankle_l")} data-zone="ankle_l" x="438" y="1300" width="90" height="35" rx="14"><title>Caviglia sinistra</title></rect>
                    <rect className={cn("zone", isSelected("ankle_r") && "is-selected")} style={getZoneTransform("ankle_r")} data-zone="ankle_r" x="496" y="1300" width="90" height="35" rx="14"><title>Caviglia destra</title></rect>
                    <path className={cn("zone", isSelected("foot_l") && "is-selected")} style={getZoneTransform("foot_l")} data-zone="foot_l" d="M410 1335 L520 1335 L540 1360 Q490 1378 420 1362 Z"><title>Piede sinistro</title></path>
                    <path className={cn("zone", isSelected("foot_r") && "is-selected")} style={getZoneTransform("foot_r")} data-zone="foot_r" d="M504 1335 L614 1335 L604 1362 Q534 1378 484 1360 Z"><title>Piede destro</title></path>
                    <rect className={cn("zone", isSelected("toes_l") && "is-selected")} style={getZoneTransform("toes_l")} data-zone="toes_l" x="418" y="1360" width="95" height="40" rx="18"><title>Dita del piede sinistro</title></rect>
                    <rect className={cn("zone", isSelected("toes_r") && "is-selected")} style={getZoneTransform("toes_r")} data-zone="toes_r" x="512" y="1360" width="95" height="40" rx="18"><title>Dita del piede destro</title></rect>
                </g>
            </svg>
        </div>
    )
}
