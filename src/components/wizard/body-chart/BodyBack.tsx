"use client"

import React from "react"

interface OffsetMap {
    [key: string]: { x: number, y: number, sx: number, sy: number, r: number }
}

const DEFAULT_OFFSET = { x: 0, y: 0, sx: 1, sy: 1, r: 0 }

interface BodyBackProps {
    selectedIds: Set<string>
    offsets: OffsetMap
    calibrationMode: boolean
    activeZone: string | null
    onPointerDown: (e: React.PointerEvent, id: string) => void
}

export default function BodyBack({ selectedIds, offsets, calibrationMode, activeZone, onPointerDown }: BodyBackProps) {
    const getProps = (id: string, label: string) => {
        const off = offsets[id] || { ...DEFAULT_OFFSET }
        const hasTransform = off.x !== 0 || off.y !== 0 || off.sx !== 1 || off.sy !== 1 || off.r !== 0
        return {
            "data-zone": id,
            "data-label": label,
            className: `zone-group ${selectedIds.has(id) ? 'is-selected' : ''} ${calibrationMode && activeZone === id ? 'active-zone' : ''}`,
            style: {
                transform: hasTransform ? `translate(${off.x}px, ${off.y}px) rotate(${off.r}deg) scale(${off.sx}, ${off.sy})` : undefined,
                transformOrigin: 'center',
                transformBox: 'fill-box'
            } as React.CSSProperties,
            onPointerDown: (e: React.PointerEvent) => onPointerDown(e, id)
        }
    }

    return (
        <>
            <g {...getProps("back_head_neck", "Testa / Collo (retro)")}>
                <title>Testa / Collo (retro)</title>
                <ellipse cx="707" cy="331" rx="110" ry="135" />
                <path d="M660 440 L754 440 L760 550 L654 550 Z" />
            </g>

            <g {...getProps("upper_back", "Schiena alta")}>
                <title>Schiena alta</title>
                <path d="M570 480 L707 480 L707 700 L600 730 L550 550 Z" />
                <path d="M844 480 L707 480 L707 700 L814 730 L864 550 Z" />
                <path d="M530 520 L600 550 L590 680 L520 650 Z" />
                <path d="M884 520 L814 550 L824 680 L894 650 Z" />
            </g>

            <g {...getProps("lower_back", "Schiena bassa")}>
                <title>Schiena bassa</title>
                <path d="M600 720 L707 690 L707 920 L650 940 Q620 900 600 720 Z" />
                <path d="M814 720 L707 690 L707 920 L764 940 Q794 900 814 720 Z" />
            </g>

            <g {...getProps("glute_l", "Gluteo sinistro")}>
                <title>Gluteo sinistro</title>
                <path d="M580 930 L707 890 L707 1050 L600 1080 Q560 1000 580 930 Z" />
            </g>
            <g {...getProps("glute_r", "Gluteo destro")}>
                <title>Gluteo destro</title>
                <path d="M834 930 L707 890 L707 1050 L814 1080 Q854 1000 834 930 Z" />
            </g>

            <g {...getProps("back_upperarm_l", "Braccio sx (retro)")}>
                <title>Braccio sx (retro)</title>
                <path d="M430 450 Q500 420 560 450 L580 580 Q500 600 410 580 Z" />
                <path d="M410 570 L580 570 L570 790 L420 790 Z" />
            </g>
            <g {...getProps("back_elbow_l", "Gomito sx (retro)")}>
                <title>Gomito sx (retro)</title>
                <path d="M420 780 L570 780 L565 850 L425 850 Z" />
            </g>
            <g {...getProps("back_forearm_l", "Avambraccio sx (retro)")}>
                <title>Avambraccio sx (retro)</title>
                <path d="M425 840 L565 840 L555 1130 L415 1130 Z" />
                <path d="M415 1120 L555 1120 L550 1170 L410 1170 Z" />
            </g>
            <g {...getProps("back_hand_l", "Mano sx (retro)")}>
                <title>Mano sx (retro)</title>
                <path d="M400 1170 L550 1170 L540 1450 L410 1450 Z" />
            </g>

            <g {...getProps("back_upperarm_r", "Braccio dx (retro)")}>
                <title>Braccio dx (retro)</title>
                <path d="M984 450 Q914 420 854 450 L834 580 Q914 600 1004 580 Z" />
                <path d="M1004 570 L834 570 L844 790 L994 790 Z" />
            </g>
            <g {...getProps("back_elbow_r", "Gomito dx (retro)")}>
                <title>Gomito dx (retro)</title>
                <path d="M994 780 L844 780 L849 850 L989 850 Z" />
            </g>
            <g {...getProps("back_forearm_r", "Avambraccio dx (retro)")}>
                <title>Avambraccio dx (retro)</title>
                <path d="M989 840 L849 840 L859 1130 L999 1130 Z" />
                <path d="M999 1120 L859 1120 L864 1170 L1004 1170 Z" />
            </g>
            <g {...getProps("back_hand_r", "Mano dx (retro)")}>
                <title>Mano dx (retro)</title>
                <path d="M1014 1170 L864 1170 L874 1450 L1004 1450 Z" />
            </g>

            <g {...getProps("back_thigh_l", "Coscia sx (retro)")}>
                <title>Coscia sx (retro)</title>
                <path d="M560 1060 L650 1060 L640 1300 L560 1280 Z" />
            </g>
            <g {...getProps("back_knee_l", "Ginocchio sx (retro)")}>
                <title>Ginocchio sx (retro)</title>
                <path d="M560 1270 L640 1270 L635 1350 L565 1350 Z" />
            </g>
            <g {...getProps("back_calf_l", "Polpaccio sx")}>
                <title>Polpaccio sx</title>
                <path d="M550 1350 L640 1350 L620 1560 L570 1560 Z" />
            </g>
            <g {...getProps("back_foot_l", "Piede sx (retro)")}>
                <title>Piede sx (retro)</title>
                <path d="M580 1550 L630 1550 L625 1600 L585 1600 Z" />
                <path d="M560 1600 L650 1600 L640 1650 L570 1650 Z" />
            </g>

            <g {...getProps("back_thigh_r", "Coscia dx (retro)")}>
                <title>Coscia dx (retro)</title>
                <path d="M854 1060 L764 1060 L774 1300 L854 1280 Z" />
            </g>
            <g {...getProps("back_knee_r", "Ginocchio dx (retro)")}>
                <title>Ginocchio dx (retro)</title>
                <path d="M854 1270 L774 1270 L779 1350 L849 1350 Z" />
            </g>
            <g {...getProps("back_calf_r", "Polpaccio dx")}>
                <title>Polpaccio dx</title>
                <path d="M864 1350 L774 1350 L794 1560 L844 1560 Z" />
            </g>
            <g {...getProps("back_foot_r", "Piede dx (retro)")}>
                <title>Piede dx (retro)</title>
                <path d="M834 1550 L784 1550 L789 1600 L829 1600 Z" />
                <path d="M854 1600 L764 1600 L774 1650 L844 1650 Z" />
            </g>
        </>
    )
}
