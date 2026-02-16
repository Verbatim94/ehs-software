/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

// CONFIGURATION
// Target Resolution: 1414 x 2048
const TARGET_W = 1414;
const TARGET_H = 2048;
const ORIGIN_W = 1024;
const ORIGIN_H = 1365;

const SCALE_X = TARGET_W / ORIGIN_W; // ~1.38
const SCALE_Y = TARGET_H / ORIGIN_H; // ~1.50 (Images are taller)

// Adjustments
const LEGS_OFFSET_Y = 100; // Shift legs down significantly as requested (was ~30px in 1024 space -> ~45px, plus extra for "floating")
const ABS_NARROW_FACTOR = 0.85; // Scale Abs width
const HIPS_WIDE_FACTOR = 1.1;   // Scale Hips width

function transformPoint(x, y, xOffset, itemId) {
    // Coordinates in DATA are already based on 1414x2048 (Center ~707) grid.
    // We just need to ensure integer rounding.
    // No more scaling from 1024x1365.

    // We might still want to apply the "offset" (formerly +/- 20) for alignment if needed, 
    // but the DATA points I wrote are already estimated in the final space.
    // Let's assume input coordinates are FINAL.

    return { x: Math.round(x), y: Math.round(y) };
}

function processD(d, xOffset, itemId) {
    return d.replace(/([A-Zn])\s*([^A-Z]+)/g, (match, command, args) => {
        const nums = args.trim().split(/[\s,]+/).map(Number);
        const newNums = [];

        for (let i = 0; i < nums.length; i += 2) {
            // Passthrough
            newNums.push(nums[i], nums[i + 1]);
        }

        return command + newNums.join(' ');
    });
}

function processRect(x, y, w, h, rx, xOffset, itemId) {
    // Since we are enforcing PATHs, we shouldn't really use this much, 
    // but for the sake of script stability, if any rect remains:
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" />`;
}

// Extract Paths from BodyFront.tsx manually or paste them here used in previous step
// I will define the raw data here

const DATA = [
    // --- HEAD / NECK ---
    // Center X = 707
    { id: 'head', type: 'ellipse', cx: 707, cy: 331, rx: 110, ry: 135, offset: 0 }, // Reduced ry slightly
    { id: 'face', type: 'ellipse', cx: 707, cy: 300, rx: 70, ry: 80, offset: 0 },
    // Neck: Organic flair
    { id: 'neck', type: 'path', d: "M660 440 Q707 460 754 440 L760 520 Q707 540 654 520 Z", offset: 0 },

    // --- ARMS (Left = Viewer Left, Right = Viewer Right) ---
    // Shoulder L (Deltoid) - Curve over shoulder
    { id: 'shoulder_l', type: 'path', d: "M430 450 Q500 420 560 450 L580 580 Q500 600 410 580 Z", offset: 0 },
    // Upper Arm L (Bicep/Tricep) - Tapers
    { id: 'upperarm_l', type: 'path', d: "M410 570 L580 570 L570 790 L420 790 Z", offset: 0 },
    // Elbow L
    { id: 'elbow_l', type: 'path', d: "M420 780 L570 780 L565 850 L425 850 Z", offset: 0 },
    // Forearm Upper L
    { id: 'forearm_upper_l', type: "path", d: "M425 840 L565 840 L555 990 L415 990 Z", offset: 0 },
    // Forearm Lower L (Wrist to Forearm)
    { id: 'forearm_lower_l', type: 'path', d: "M415 980 L555 980 L545 1130 L405 1130 Z", offset: 0 },
    // Wrist L
    { id: 'wrist_l', type: 'path', d: "M405 1120 L545 1120 L540 1170 L400 1170 Z", offset: 0 },
    // Hand L - Mitt shape
    { id: 'hand_l', type: 'path', d: "M390 1170 L550 1170 Q560 1250 540 1320 L400 1320 Q380 1250 390 1170 Z", offset: 0 },
    // Fingers L
    { id: 'fingers_l', type: 'path', d: "M400 1310 L540 1310 Q550 1420 470 1440 Q390 1420 400 1310 Z", offset: 0 },

    // Shoulder R (Deltoid)
    { id: 'shoulder_r', type: 'path', d: "M984 450 Q914 420 854 450 L834 580 Q914 600 1004 580 Z", offset: 0 },
    // Upper Arm R
    { id: 'upperarm_r', type: 'path', d: "M1004 570 L834 570 L844 790 L994 790 Z", offset: 0 },
    // Elbow R
    { id: 'elbow_r', type: 'path', d: "M994 780 L844 780 L849 850 L989 850 Z", offset: 0 },
    // Forearm Upper R
    { id: 'forearm_upper_r', type: 'path', d: "M989 840 L849 840 L859 990 L999 990 Z", offset: 0 },
    // Forearm Lower R
    { id: 'forearm_lower_r', type: 'path', d: "M999 980 L859 980 L869 1130 L1009 1130 Z", offset: 0 },
    // Wrist R
    { id: 'wrist_r', type: 'path', d: "M1009 1120 L869 1120 L874 1170 L1014 1170 Z", offset: 0 },
    // Hand R
    { id: 'hand_r', type: 'path', d: "M1024 1170 L864 1170 Q854 1250 874 1320 L1014 1320 Q1034 1250 1024 1170 Z", offset: 0 },
    // Fingers R
    { id: 'fingers_r', type: 'path', d: "M1014 1310 L874 1310 Q864 1420 944 1440 Q1024 1420 1014 1310 Z", offset: 0 },


    // --- TORSO (Based on 1414 scale, center ~707) ---
    // Chest L (Pec shape)
    { id: 'chest_upper_l', type: 'path', d: "M580 470 L707 470 L707 550 Q650 570 580 520 Z", offset: 0 },
    // Chest R
    { id: 'chest_upper_r', type: 'path', d: "M834 470 L707 470 L707 550 Q764 570 834 520 Z", offset: 0 },

    // Chest Mid (Lower Pec/Sternum)
    { id: 'chest_mid_l', type: 'path', d: "M580 515 Q630 570 707 560 L707 650 L610 660 Q570 600 580 515 Z", offset: 0 },
    { id: 'chest_mid_r', type: 'path', d: "M834 515 Q784 570 707 560 L707 650 L904 660 Q944 600 834 515 Z", offset: 0 },

    // Ribs (Side)
    { id: 'ribs_l', type: 'path', d: "M550 560 L580 530 L610 660 L540 650 Z", offset: 0 },
    { id: 'ribs_r', type: 'path', d: "M864 560 L834 530 L804 660 L874 650 Z", offset: 0 },

    // Abs Upper (Tapering in)
    { id: 'abdomen_upper_l', type: 'path', d: "M610 660 L707 650 L707 760 L620 770 Q600 710 610 660 Z", offset: 0 },
    { id: 'abdomen_upper_r', type: 'path', d: "M804 660 L707 650 L707 760 L794 770 Q814 710 804 660 Z", offset: 0 },

    // Abs Lower (Widening out)
    { id: 'abdomen_lower_l', type: 'path', d: "M620 765 L707 755 L707 850 L630 870 Q615 820 620 765 Z", offset: 0 },
    { id: 'abdomen_lower_r', type: 'path', d: "M794 765 L707 755 L707 850 L784 870 Q799 820 794 765 Z", offset: 0 },

    // Pelvis
    { id: 'pelvis_l', type: 'path', d: "M630 865 L707 845 L707 920 L650 940 Q625 900 630 865 Z", offset: 0 },
    { id: 'pelvis_r', type: 'path', d: "M784 865 L707 845 L707 920 L764 940 Q789 900 784 865 Z", offset: 0 },

    // Groin
    { id: 'groin', type: 'path', d: "M660 940 L754 940 L707 1010 Z", offset: 0 },

    // Hips (Wide wrap)
    { id: 'hip_l', type: 'path', d: "M550 670 L610 685 L630 870 L650 940 L560 920 Q530 800 550 670 Z", offset: 0 },
    { id: 'hip_r', type: 'path', d: "M864 670 L804 685 L784 870 L764 940 L854 920 Q884 800 864 670 Z", offset: 0 },

    // --- LEGS (Moved Down: Y ~ +100 relative to previous logic, baked here) ---
    // Previous Knee was ~1090. If we move down 100 -> ~1200.

    // Thigh Outer (Quad curve)
    { id: 'thigh_outer_l', type: 'path', d: "M560 920 L640 940 L620 1150 L560 1130 Q540 1020 560 920 Z", offset: 0 },
    { id: 'thigh_inner_l', type: 'path', d: "M650 945 L707 930 L690 1145 L630 1150 L650 945 Z", offset: 0 },

    { id: 'thigh_inner_r', type: 'path', d: "M764 945 L707 930 L724 1145 L784 1150 L764 945 Z", offset: 0 },
    { id: 'thigh_outer_r', type: 'path', d: "M854 920 L774 940 L794 1150 L854 1130 Q874 1020 854 920 Z", offset: 0 },

    // Knees (Hex padding shape)
    { id: 'knee_l', type: 'path', d: "M580 1140 L670 1140 L665 1240 L585 1240 Z", offset: 0 },
    { id: 'knee_r', type: 'path', d: "M744 1140 L834 1140 L829 1240 L749 1240 Z", offset: 0 },

    // Shins/Calves (Tapering to ankle)
    // Calf bulges out at top
    { id: 'shin_l', type: 'path', d: "M600 1240 L665 1240 L650 1450 L610 1450 Z", offset: 0 },
    { id: 'calf_l', type: 'path', d: "M580 1240 L600 1240 L610 1440 L570 1420 Q550 1300 580 1240 Z", offset: 0 },

    { id: 'shin_r', type: 'path', d: "M749 1240 L814 1240 L799 1450 L759 1450 Z", offset: 0 },
    { id: 'calf_r', type: 'path', d: "M834 1240 L814 1240 L804 1440 L844 1420 Q864 1300 834 1240 Z", offset: 0 },

    // Ankles
    { id: 'ankle_l', type: 'path', d: "M590 1440 L660 1440 L655 1500 L595 1500 Z", offset: 0 },
    { id: 'ankle_r', type: 'path', d: "M754 1440 L824 1440 L819 1500 L759 1500 Z", offset: 0 },

    // Feet
    { id: 'foot_l', type: 'path', d: "M580 1500 L660 1500 L670 1550 L570 1550 Z", offset: 0 },
    { id: 'foot_r', type: 'path', d: "M754 1500 L834 1500 L824 1550 L744 1550 Z", offset: 0 },

    // Toes
    { id: 'toes_l', type: 'path', d: "M575 1550 L665 1550 Q675 1590 620 1600 Q565 1590 575 1550 Z", offset: 0 },
    { id: 'toes_r', type: 'path', d: "M749 1550 L839 1550 Q849 1590 794 1600 Q739 1590 749 1550 Z", offset: 0 },
];

const DATA_BACK = [
    // --- HEAD ---
    { id: 'back_head', type: 'ellipse', cx: 707, cy: 331, rx: 110, ry: 135, offset: 0 },
    { id: 'back_neck', type: 'path', d: "M660 440 L754 440 L760 550 L654 550 Z", offset: 0 },

    // --- UPPER BACK ---
    { id: 'upper_back_l', type: 'path', d: "M570 480 L707 480 L707 700 L600 730 L550 550 Z", offset: 0 },
    { id: 'upper_back_r', type: 'path', d: "M844 480 L707 480 L707 700 L814 730 L864 550 Z", offset: 0 },

    // Scapula
    { id: 'scapula_l', type: 'path', d: "M530 520 L600 550 L590 680 L520 650 Z", offset: 0 },
    { id: 'scapula_r', type: 'path', d: "M884 520 L814 550 L824 680 L894 650 Z", offset: 0 },

    // --- LOWER BACK ---
    { id: 'lower_back_l', type: 'path', d: "M600 720 L707 690 L707 920 L650 940 Q620 900 600 720 Z", offset: 0 },
    { id: 'lower_back_r', type: 'path', d: "M814 720 L707 690 L707 920 L764 940 Q794 900 814 720 Z", offset: 0 },

    // --- GLUTES ---
    { id: 'glute_l', type: 'path', d: "M580 930 L707 890 L707 1050 L600 1080 Q560 1000 580 930 Z", offset: 0 },
    { id: 'glute_r', type: 'path', d: "M834 930 L707 890 L707 1050 L814 1080 Q854 1000 834 930 Z", offset: 0 },

    // --- ARMS BACK (Organic Paths) ---
    // Shoulders Back
    { id: 'back_shoulder_l', type: 'path', d: "M430 450 Q500 420 560 450 L580 580 Q500 600 410 580 Z", offset: 0 },
    { id: 'back_shoulder_r', type: 'path', d: "M984 450 Q914 420 854 450 L834 580 Q914 600 1004 580 Z", offset: 0 },

    // Upper Arms Back
    { id: 'back_upperarm_l', type: 'path', d: "M410 570 L580 570 L570 790 L420 790 Z", offset: 0 },
    { id: 'back_upperarm_r', type: 'path', d: "M1004 570 L834 570 L844 790 L994 790 Z", offset: 0 },

    // Elbows Back
    { id: 'back_elbow_l', type: 'path', d: "M420 780 L570 780 L565 850 L425 850 Z", offset: 0 },
    { id: 'back_elbow_r', type: 'path', d: "M994 780 L844 780 L849 850 L989 850 Z", offset: 0 },

    // Forearms Back
    { id: 'back_forearm_l', type: 'path', d: "M425 840 L565 840 L555 1130 L415 1130 Z", offset: 0 },
    { id: 'back_forearm_r', type: 'path', d: "M989 840 L849 840 L859 1130 L999 1130 Z", offset: 0 },

    // Wrists Back
    { id: 'back_wrist_l', type: 'path', d: "M415 1120 L555 1120 L550 1170 L410 1170 Z", offset: 0 },
    { id: 'back_wrist_r', type: 'path', d: "M999 1120 L859 1120 L864 1170 L1004 1170 Z", offset: 0 },

    // Hands Back
    { id: 'back_hand_l', type: 'path', d: "M400 1170 L550 1170 L540 1450 L410 1450 Z", offset: 0 },
    { id: 'back_hand_r', type: 'path', d: "M1014 1170 L864 1170 L874 1450 L1004 1450 Z", offset: 0 },

    // --- LEGS BACK (Organic Paths) ---
    // Thighs Back
    { id: 'back_thigh_l', type: 'path', d: "M560 1060 L650 1060 L640 1300 L560 1280 Z", offset: 0 },
    { id: 'back_thigh_r', type: 'path', d: "M854 1060 L764 1060 L774 1300 L854 1280 Z", offset: 0 },

    // Knees Back (Popliteal)
    { id: 'back_knee_l', type: 'path', d: "M560 1270 L640 1270 L635 1350 L565 1350 Z", offset: 0 },
    { id: 'back_knee_r', type: 'path', d: "M854 1270 L774 1270 L779 1350 L849 1350 Z", offset: 0 },

    // Calves Back
    { id: 'back_calf_l', type: 'path', d: "M550 1350 L640 1350 L620 1560 L570 1560 Z", offset: 0 },
    { id: 'back_calf_r', type: 'path', d: "M864 1350 L774 1350 L794 1560 L844 1560 Z", offset: 0 },

    // Ankles Back
    { id: 'back_ankle_l', type: 'path', d: "M580 1550 L630 1550 L625 1600 L585 1600 Z", offset: 0 },
    { id: 'back_ankle_r', type: 'path', d: "M834 1550 L784 1550 L789 1600 L829 1600 Z", offset: 0 },

    // Feet Back
    { id: 'back_foot_l', type: 'path', d: "M560 1600 L650 1600 L640 1650 L570 1650 Z", offset: 0 },
    { id: 'back_foot_r', type: 'path', d: "M854 1600 L764 1600 L774 1650 L844 1650 Z", offset: 0 },
];


// --- MAPPING 50 -> 24 ---
// These are no longer used directly by generateGroups, but kept for reference if needed elsewhere.
const FRONT_GROUPS = {
    head_neck: ['head', 'face', 'neck'],
    chest_l: ['chest_upper_l', 'chest_mid_l', 'ribs_l'],
    chest_r: ['chest_upper_r', 'chest_mid_r', 'ribs_r'],
    abdomen: ['abdomen_upper_l', 'abdomen_upper_r', 'abdomen_lower_l', 'abdomen_lower_r'],
    hip_l: ['pelvis_l', 'hip_l'],
    hip_r: ['pelvis_r', 'hip_r'],
    groin: ['groin'],
    arm_upper_l: ['shoulder_l', 'upperarm_l', 'elbow_l'],
    arm_lower_l: ['forearm_upper_l', 'forearm_lower_l', 'wrist_l', 'hand_l', 'fingers_l'],
    arm_upper_r: ['shoulder_r', 'upperarm_r', 'elbow_r'],
    arm_lower_r: ['forearm_upper_r', 'forearm_lower_r', 'wrist_r', 'hand_r', 'fingers_r'],
    leg_upper_l: ['thigh_outer_l', 'thigh_inner_l', 'knee_l'],
    leg_lower_l: ['shin_l', 'calf_l', 'ankle_l', 'foot_l', 'toes_l'],
    leg_upper_r: ['thigh_outer_r', 'thigh_inner_r', 'knee_r'],
    leg_lower_r: ['shin_r', 'calf_r', 'ankle_r', 'foot_r', 'toes_r'],
};

const BACK_GROUPS = {
    back_head_neck: ['back_head', 'back_neck'],
    upper_back: ['upper_back_l', 'upper_back_r', 'scapula_l', 'scapula_r'],
    lower_back: ['lower_back_l', 'lower_back_r'],
    glute_l: ['glute_l'],
    glute_r: ['glute_r'],
    back_arm_l: ['back_upperarm_l', 'back_forearm_l', 'back_hand_l'],
    back_arm_r: ['back_upperarm_r', 'back_forearm_r', 'back_hand_r'],
    back_leg_l: ['thigh_back_l', 'knee_back_l', 'calf_back_l', 'back_ankle_l', 'back_foot_l'],
    back_leg_r: ['thigh_back_r', 'knee_back_r', 'calf_back_r', 'back_ankle_r', 'back_foot_r'],
};

const LABELS = {
    head_neck: "Testa / Collo",
    chest_l: "Torace sinistro",
    chest_r: "Torace destro",
    abdomen: "Addome",
    hip_l: "Anca sinistra",
    hip_r: "Anca destra",
    groin: "Inguine",
    arm_upper_l: "Braccio sinistro (alto)",
    arm_lower_l: "Avambraccio + Mano sinistra",
    arm_upper_r: "Braccio destro (alto)",
    arm_lower_r: "Avambraccio + Mano destra",
    leg_upper_l: "Coscia sinistra",
    leg_lower_l: "Gamba + Piede sinistro",
    leg_upper_r: "Coscia destra",
    leg_lower_r: "Gamba + Piede destro",
    back_head_neck: "Testa / Collo (retro)",
    upper_back: "Schiena alta",
    lower_back: "Schiena bassa",
    glute_l: "Gluteo sinistro",
    glute_r: "Gluteo destro",
    back_arm_l: "Braccio sinistro (retro)",
    back_arm_r: "Braccio destro (retro)",
    back_leg_l: "Gamba sinistra (retro)",
    back_leg_r: "Gamba destra (retro)"
};

console.log('--- GENERATING FRONT GROUPS ---');
generateGroups(DATA, FRONT_GROUPS);

console.log('--- GENERATING BACK GROUPS ---');
generateGroups(DATA_BACK, BACK_GROUPS);

function generateGroups(sourceData, groupMap) {
    // 1. Pre-process all items to get their baked SVG string
    const processedItems = {};

    sourceData.forEach(item => {
        const scale = item.scale || 0.59;
        let svgEl = '';
        if (item.type === 'rect') {
            svgEl = processRect(item.x, item.y, item.w, item.h, item.rx, item.offset, item.id);
        } else if (item.type === 'ellipse') {
            // Treat ellipse center as a point
            const { x: cx_new, y: cy_new } = transformPoint(item.cx, item.cy, item.offset, item.id);
            // Scale radii
            const rx = Math.round(item.rx * SCALE_X);
            const ry = Math.round(item.ry * SCALE_Y);
            svgEl = `<ellipse cx="${cx_new}" cy="${cy_new}" rx="${rx}" ry="${ry}" />`;
        } else if (item.type === 'path') {
            const newD = processD(item.d, item.offset, item.id);
            svgEl = `<path d="${newD}" />`;
        }
        processedItems[item.id] = svgEl;
    });

    // 2. Output Groups to File
    let fileContent = '';

    Object.entries(groupMap).forEach(([groupId, subIds]) => {
        const title = LABELS[groupId] || groupId;
        fileContent += `<g data-zone="${groupId}" data-label="${title}" className={isSel("${groupId}")}>\n`;
        fileContent += `  <title>${title}</title>\n`;
        subIds.forEach(subId => {
            if (processedItems[subId]) {
                fileContent += `  ${processedItems[subId]}\n`;
            } else {
                console.warn(`WARNING: Missing subId ${subId} for group ${groupId}`);
            }
        });
        fileContent += `</g>\n`;
    });

    fs.appendFileSync('body_chart_paths.txt', fileContent);
}

// Clear file first
fs.writeFileSync('body_chart_paths.txt', '');

console.log('--- GENERATING FRONT GROUPS ---');
fs.appendFileSync('body_chart_paths.txt', '--- FRONT ---\n');
generateGroups(DATA, FRONT_GROUPS);

console.log('--- GENERATING BACK GROUPS ---');
fs.appendFileSync('body_chart_paths.txt', '--- BACK ---\n');
generateGroups(DATA_BACK, BACK_GROUPS);


