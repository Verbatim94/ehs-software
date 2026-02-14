"use client"

import React from "react"

interface OffsetMap {
    [key: string]: { x: number, y: number, sx: number, sy: number, r: number }
}

const DEFAULT_OFFSET = { x: 0, y: 0, sx: 1, sy: 1, r: 0 }

interface BodyFrontProps {
    selectedIds: Set<string>
    offsets: OffsetMap
    calibrationMode: boolean
    activeZone: string | null
    onPointerDown: (e: React.PointerEvent, id: string) => void
}

export default function BodyFront({ selectedIds, offsets, calibrationMode, activeZone, onPointerDown }: BodyFrontProps) {
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
            {/* HEAD / NECK */}
            <g {...getProps("head_neck", "Testa / Collo")}>
                <title>Testa / Collo</title>
                <ellipse cx="707" cy="331" rx="110" ry="135" />
                <ellipse cx="707" cy="300" rx="70" ry="80" />
                <path d="M660 440 Q707 460 754 440 L760 520 Q707 540 654 520 Z" />
            </g>

            {/* TORSO */}
            <g {...getProps("chest_l", "Torace sinistro")}>
                <title>Torace sinistro</title>
                <path d="M580 470 L707 470 L707 550 Q650 570 580 520 Z" />
                <path d="M580 515 Q630 570 707 560 L707 650 L610 660 Q570 600 580 515 Z" />
                <path d="M550 560 L580 530 L610 660 L540 650 Z" />
            </g>
            <g {...getProps("chest_r", "Torace destro")}>
                <title>Torace destro</title>
                <path d="M834 470 L707 470 L707 550 Q764 570 834 520 Z" />
                <path d="M834 515 Q784 570 707 560 L707 650 L904 660 Q944 600 834 515 Z" />
                <path d="M864 560 L834 530 L804 660 L874 650 Z" />
            </g>
            <g {...getProps("abdomen", "Addome")}>
                <title>Addome</title>
                <path d="M610 660 L707 650 L707 760 L620 770 Q600 710 610 660 Z" />
                <path d="M804 660 L707 650 L707 760 L794 770 Q814 710 804 660 Z" />
                <path d="M620 765 L707 755 L707 850 L630 870 Q615 820 620 765 Z" />
                <path d="M794 765 L707 755 L707 850 L784 870 Q799 820 794 765 Z" />
                <path d="M630 865 L707 845 L707 920 L650 940 Q625 900 630 865 Z" />
                <path d="M784 865 L707 845 L707 920 L764 940 Q789 900 784 865 Z" />
            </g>
            <g {...getProps("hip_l", "Fianco sinistro")}>
                <title>Fianco sinistro</title>
                <path d="M550 670 L610 685 L630 870 L650 940 L560 920 Q530 800 550 670 Z" />
            </g>
            <g {...getProps("hip_r", "Fianco destro")}>
                <title>Fianco destro</title>
                <path d="M864 670 L804 685 L784 870 L764 940 L854 920 Q884 800 864 670 Z" />
            </g>
            <g {...getProps("groin", "Inguine")}>
                <title>Inguine</title>
                <path d="M660 940 L754 940 L707 1010 Z" />
            </g>

            {/* ARMS - GRANULAR */}
            <g {...getProps("arm_upper_l", "Braccio sx (alto)")}>
                <title>Braccio sx (alto)</title>
                <path d="M430 450 Q500 420 560 450 L580 580 Q500 600 410 580 Z" />
                <path d="M410 570 L580 570 L570 790 L420 790 Z" />
            </g>
            <g {...getProps("elbow_l", "Gomito sx")}>
                <title>Gomito sx</title>
                <path d="M420 780 L570 780 L565 850 L425 850 Z" />
            </g>
            <g {...getProps("forearm_l", "Avambraccio sx")}>
                <title>Avambraccio sx</title>
                <path d="M425 840 L565 840 L555 990 L415 990 Z" />
                <path d="M415 980 L555 980 L545 1130 L405 1130 Z" />
            </g>
            <g {...getProps("hand_l", "Mano sx")}>
                <title>Mano sx</title>
                <path d="M405 1120 L545 1120 L540 1170 L400 1170 Z" />
                <path d="M390 1170 L550 1170 Q560 1250 540 1320 L400 1320 Q380 1250 390 1170 Z" />
                <path d="M400 1310 L540 1310 Q550 1420 470 1440 Q390 1420 400 1310 Z" />
            </g>

            <g {...getProps("arm_upper_r", "Braccio dx (alto)")}>
                <title>Braccio dx (alto)</title>
                <path d="M984 450 Q914 420 854 450 L834 580 Q914 600 1004 580 Z" />
                <path d="M1004 570 L834 570 L844 790 L994 790 Z" />
            </g>
            <g {...getProps("elbow_r", "Gomito dx")}>
                <title>Gomito dx</title>
                <path d="M994 780 L844 780 L849 850 L989 850 Z" />
            </g>
            <g {...getProps("forearm_r", "Avambraccio dx")}>
                <title>Avambraccio dx</title>
                <path d="M989 840 L849 840 L859 990 L999 990 Z" />
                <path d="M999 980 L859 980 L869 1130 L1009 1130 Z" />
            </g>
            <g {...getProps("hand_r", "Mano dx")}>
                <title>Mano dx</title>
                <path d="M1009 1120 L869 1120 L874 1170 L1014 1170 Z" />
                <path d="M1024 1170 L864 1170 Q854 1250 874 1320 L1014 1320 Q1034 1250 1024 1170 Z" />
                <path d="M1014 1310 L874 1310 Q864 1420 944 1440 Q1024 1420 1014 1310 Z" />
            </g>

            {/* LEGS - GRANULAR */}
            <g {...getProps("thigh_l", "Coscia sx")}>
                <title>Coscia sx</title>
                <path d="M560 920 L640 940 L620 1150 L560 1130 Q540 1020 560 920 Z" />
                <path d="M650 945 L707 930 L690 1145 L630 1150 L650 945 Z" />
            </g>
            <g {...getProps("knee_l", "Ginocchio sx")}>
                <title>Ginocchio sx</title>
                <path d="M580 1140 L670 1140 L665 1240 L585 1240 Z" />
            </g>
            <g {...getProps("shin_l", "Stinco sx")}>
                <title>Stinco sx</title>
                <path d="M600 1240 L665 1240 L650 1450 L610 1450 Z" />
                <path d="M580 1240 L600 1240 L610 1440 L570 1420 Q550 1300 580 1240 Z" />
            </g>
            <g {...getProps("foot_l", "Piede sx")}>
                <title>Piede sx</title>
                <path d="M590 1440 L660 1440 L655 1500 L595 1500 Z" />
                <path d="M580 1500 L660 1500 L670 1550 L570 1550 Z" />
                <path d="M575 1550 L665 1550 Q675 1590 620 1600 Q565 1590 575 1550 Z" />
            </g>

            <g {...getProps("thigh_r", "Coscia dx")}>
                <title>Coscia dx</title>
                <path d="M854 920 L774 940 L794 1150 L854 1130 Q874 1020 854 920 Z" />
                <path d="M764 945 L707 930 L724 1145 L784 1150 L764 945 Z" />
            </g>
            <g {...getProps("knee_r", "Ginocchio dx")}>
                <title>Ginocchio dx</title>
                <path d="M744 1140 L834 1140 L829 1240 L749 1240 Z" />
            </g>
            <g {...getProps("shin_r", "Stinco dx")}>
                <title>Stinco dx</title>
                <path d="M749 1240 L814 1240 L799 1450 L759 1450 Z" />
                <path d="M834 1240 L814 1240 L804 1440 L844 1420 Q864 1300 834 1240 Z" />
            </g>
            <g {...getProps("foot_r", "Piede dx")}>
                <title>Piede dx</title>
                <path d="M754 1440 L824 1440 L819 1500 L759 1500 Z" />
                <path d="M754 1500 L834 1500 L824 1550 L744 1550 Z" />
                <path d="M749 1550 L839 1550 Q849 1590 794 1600 Q739 1590 749 1550 Z" />
            </g>
        </>
    )
}
