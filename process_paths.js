
const fs = require('fs');

// CONFIGURATION
// Scale: 0.59
// Y-Offset: -157px
// Center: 512, 682.5
// X-Offsets: 
//   - Torso/Legs: +/- 20
//   - Arms: +/- 70

function transformPoint(x, y, xOffset) {
    const scale = 0.59;
    const yOffset = -157;
    const cx = 512;
    const cy = 682.5;

    const nx = (x - cx) * scale + cx + xOffset;
    const ny = (y - cy) * scale + cy + yOffset;
    return { x: Math.round(nx), y: Math.round(ny) }; // rounding to integer for cleaner SVG
}

function processD(d, xOffset) {
    return d.replace(/([A-Zn])\s*([^A-Z]+)/g, (match, command, args) => {
        const nums = args.trim().split(/[\s,]+/).map(Number);
        const newNums = [];

        // Simple handling for M, L, Q (which take x,y pairs)
        // Note: This matches the specific paths used in BodyFront.tsx which invoke M, L, Q
        // Does not handle relative commands (lower case) or complex arcs perfectly without parsing
        // But our paths are simple absolute coordinates (M, L, Q).

        for (let i = 0; i < nums.length; i += 2) {
            const { x, y } = transformPoint(nums[i], nums[i + 1], xOffset);
            newNums.push(x, y);
        }

        return command + newNums.join(' ');
    });
}

// Function to process RECT to PATH
// Since we want standard paths, we convert rects to paths: M x y L x+w y L x+w y+h L x y+h Z
// And apply transform
function processRect(x, y, w, h, rx, xOffset) {
    // approximating rect as path for simplicity or just transforming rect?
    // User asked for "paths preferred". Let's convert rect to path.
    // If rx is present, it's a rounded rect. Simple rect for now or baked coordinates.
    // Let's just output the transformed 4 corners for now (ignoring RX for simplicity or implementing it?)
    // Actually, preserving RX is hard with just path.
    // But wait, user said "Antigravity must redraw...".
    // If I prefer, I can stick to rects but validly transformed coordinates? 
    // No, <rect> doesn't accept "top-left" as a transform, it accepts x,y,width,height.
    // If we scale, the width/height change too.

    const scale = 0.59;
    const nw = w * scale;
    const nh = h * scale;
    const { x: nx, y: ny } = transformPoint(x, y, xOffset);

    // For rounded rect, rx also scales
    const nrx = (rx || 0) * scale;

    return `<rect x="${Math.round(nx)}" y="${Math.round(ny)}" width="${Math.round(nw)}" height="${Math.round(nh)}" rx="${Math.round(nrx)}" />`;
}

// Extract Paths from BodyFront.tsx manually or paste them here used in previous step
// I will define the raw data here

const DATA = [
    // --- HEAD (Center, offset 0) ---
    { id: 'head', type: 'ellipse', cx: 512, cy: 165, rx: 80, ry: 95, offset: 0 },
    { id: 'face', type: 'ellipse', cx: 512, cy: 145, rx: 55, ry: 60, offset: 0 },
    { id: 'neck', type: 'rect', x: 480, y: 255, w: 64, h: 75, rx: 26, offset: 0 },

    // --- LEFT ARM (Offset -70) ---
    { id: 'shoulder_l', type: 'rect', x: 330, y: 315, w: 110, h: 75, rx: 30, offset: -70 },
    { id: 'upperarm_l', type: 'rect', x: 300, y: 390, w: 110, h: 210, rx: 44, offset: -70 },
    { id: 'elbow_l', type: 'rect', x: 300, y: 600, w: 110, h: 70, rx: 26, offset: -70 },
    { id: 'forearm_upper_l', type: 'rect', x: 300, y: 670, w: 110, h: 150, rx: 44, offset: -70 },
    // Forearm Lower L has special transform in old code: translate(-84px, -193px).
    // Let's apply that specific offset. 
    // Global: y = (y-682.5)*0.59 + 682.5 - 157.
    // Specific: y_new = (y-682.5)*0.59 + 682.5 - 193?
    // Wait, the specific transform was replacing the global one?
    // Code said: if (...) return { transform: "translate(-84px, -193px) scale(0.59)" }
    // So for these specific parts, I use their specific offsets.
    // Special Left: (-84, -193)
    { id: 'forearm_lower_l', type: 'rect', x: 300, y: 820, w: 110, h: 160, rx: 44, customX: -84, customY: -193 },
    { id: 'wrist_l', type: 'rect', x: 305, y: 980, w: 100, h: 40, rx: 16, customX: -96, customY: -200 },
    { id: 'hand_l', type: 'rect', x: 290, y: 1020, w: 130, h: 110, rx: 36, customX: -113, customY: -200, scale: 0.55 },
    { id: 'fingers_l', type: 'rect', x: 290, y: 1130, w: 130, h: 90, rx: 30, customX: -113, customY: -200, scale: 0.55 },

    // --- RIGHT ARM (Offset +70) ---
    { id: 'shoulder_r', type: 'rect', x: 584, y: 315, w: 110, h: 75, rx: 30, offset: 70 },
    { id: 'upperarm_r', type: 'rect', x: 614, y: 390, w: 110, h: 210, rx: 44, offset: 70 },
    { id: 'elbow_r', type: 'rect', x: 614, y: 600, w: 110, h: 70, rx: 26, offset: 70 },
    { id: 'forearm_upper_r', type: 'rect', x: 614, y: 670, w: 110, h: 150, rx: 44, offset: 70 },
    // Specials Right
    { id: 'forearm_lower_r', type: 'rect', x: 614, y: 820, w: 110, h: 160, rx: 44, customX: 84, customY: -193 },
    { id: 'wrist_r', type: 'rect', x: 619, y: 980, w: 100, h: 40, rx: 16, customX: 96, customY: -200 },
    { id: 'hand_r', type: 'rect', x: 604, y: 1020, w: 130, h: 110, rx: 36, customX: 113, customY: -200, scale: 0.55 },
    { id: 'fingers_r', type: 'rect', x: 604, y: 1130, w: 130, h: 90, rx: 30, customX: 113, customY: -200, scale: 0.55 },

    // --- TORSO (Offset -20 / +20) ---
    { id: 'chest_upper_l', type: 'path', d: "M430 335 L510 335 L510 430 L442 450 Q410 420 430 335 Z", offset: -20 },
    { id: 'chest_upper_r', type: 'path', d: "M514 335 L594 335 Q614 420 582 450 L514 430 Z", offset: 20 },
    { id: 'chest_mid_l', type: 'path', d: "M442 450 L510 430 L510 520 L452 538 Q420 510 442 450 Z", offset: -20 },
    { id: 'chest_mid_r', type: 'path', d: "M514 430 L582 450 Q604 510 572 538 L514 520 Z", offset: 20 },
    { id: 'ribs_l', type: 'path', d: "M392 420 L442 450 Q420 510 452 538 L410 560 Q360 520 392 420 Z", offset: -20 },
    { id: 'ribs_r', type: 'path', d: "M632 420 L582 450 Q604 510 572 538 L614 560 Q664 520 632 420 Z", offset: 20 },

    { id: 'abdomen_upper_l', type: 'path', d: "M452 538 L510 520 L510 610 L460 628 Q430 602 452 538 Z", offset: -20 },
    { id: 'abdomen_upper_r', type: 'path', d: "M514 520 L572 538 Q594 602 564 628 L514 610 Z", offset: 20 },
    { id: 'abdomen_lower_l', type: 'path', d: "M460 628 L510 610 L510 700 L468 718 Q440 694 460 628 Z", offset: -20 },
    { id: 'abdomen_lower_r', type: 'path', d: "M514 610 L564 628 Q584 694 556 718 L514 700 Z", offset: 20 },

    { id: 'pelvis_l', type: 'path', d: "M468 718 L510 700 L510 790 L478 805 Q448 780 468 718 Z", offset: -20 },
    { id: 'pelvis_r', type: 'path', d: "M514 700 L556 718 Q576 780 546 805 L514 790 Z", offset: 20 },
    { id: 'groin', type: 'path', d: "M478 805 L546 805 L562 840 Q512 900 462 840 Z", offset: 0 },

    { id: 'hip_l', type: 'path', d: "M430 760 L478 805 Q448 860 402 850 Q400 800 430 760 Z", offset: -20 },
    { id: 'hip_r', type: 'path', d: "M594 760 L546 805 Q576 860 622 850 Q624 800 594 760 Z", offset: 20 },

    // --- LEGS (Offset -20 / +20) ---
    { id: 'thigh_outer_l', type: 'rect', x: 410, y: 860, w: 80, h: 220, rx: 40, offset: -20 },
    { id: 'thigh_inner_l', type: 'rect', x: 490, y: 860, w: 60, h: 220, rx: 30, offset: -20 },
    { id: 'thigh_inner_r', type: 'rect', x: 474, y: 860, w: 60, h: 220, rx: 30, offset: 20 },
    { id: 'thigh_outer_r', type: 'rect', x: 534, y: 860, w: 80, h: 220, rx: 40, offset: 20 },

    { id: 'knee_l', type: 'rect', x: 430, y: 1080, w: 110, h: 80, rx: 26, offset: -20 },
    { id: 'knee_r', type: 'rect', x: 484, y: 1080, w: 110, h: 80, rx: 26, offset: 20 },

    { id: 'shin_l', type: 'rect', x: 438, y: 1160, w: 90, h: 140, rx: 40, offset: -20 },
    { id: 'calf_l', type: 'rect', x: 410, y: 1160, w: 28, h: 140, rx: 14, offset: -20 },
    { id: 'shin_r', type: 'rect', x: 496, y: 1160, w: 90, h: 140, rx: 40, offset: 20 },
    { id: 'calf_r', type: 'rect', x: 586, y: 1160, w: 28, h: 140, rx: 14, offset: 20 },

    { id: 'ankle_l', type: 'rect', x: 438, y: 1300, w: 90, h: 35, rx: 14, offset: -20 },
    { id: 'ankle_r', type: 'rect', x: 496, y: 1300, w: 90, h: 35, rx: 14, offset: 20 },
    { id: 'foot_l', type: 'path', d: "M410 1335 L520 1335 L540 1360 Q490 1378 420 1362 Z", offset: -20 },
    { id: 'foot_r', type: 'path', d: "M504 1335 L614 1335 L604 1362 Q534 1378 484 1360 Z", offset: 20 },
    { id: 'toes_l', type: 'rect', x: 418, y: 1360, w: 95, h: 40, rx: 18, offset: -20 },
    { id: 'toes_r', type: 'rect', x: 512, y: 1360, w: 95, h: 40, rx: 18, offset: 20 },
];

const DATA_BACK = [
    // --- HEAD (Center, offset 0) ---
    { id: 'back_head', type: 'ellipse', cx: 512, cy: 165, rx: 80, ry: 95, offset: 0 },
    { id: 'back_neck', type: 'rect', x: 480, y: 255, w: 64, h: 75, rx: 26, offset: 0 },

    // --- UPPER BACK / SCAPULA (Offset -20 / +20) ---
    { id: 'upper_back_l', type: 'path', d: "M420 335 L510 335 L510 460 L440 480 Q400 450 420 335 Z", offset: -20 },
    { id: 'upper_back_r', type: 'path', d: "M514 335 L604 335 Q624 450 584 480 L514 460 Z", offset: 20 },
    { id: 'scapula_l', type: 'path', d: "M390 360 L440 380 L430 450 L385 430 Z", offset: -20 },
    { id: 'scapula_r', type: 'path', d: "M634 360 L584 380 L594 450 L639 430 Z", offset: 20 },

    // --- LOWER BACK (Offset -20 / +20) ---
    { id: 'lower_back_l', type: 'path', d: "M440 480 L510 460 L510 620 L452 640 Q420 610 440 480 Z", offset: -20 },
    { id: 'lower_back_r', type: 'path', d: "M514 460 L584 480 Q604 610 572 640 L514 620 Z", offset: 20 },

    // --- GLUTES (Offset -20 / +20) ---
    { id: 'glute_l', type: 'path', d: "M420 700 L510 660 L510 820 L442 840 Q400 800 420 700 Z", offset: -20 },
    { id: 'glute_r', type: 'path', d: "M514 660 L604 700 Q624 800 582 840 L514 820 Z", offset: 20 },

    // --- ARMS BACK (Offset +/- 70) ---
    // Using simple rects as placeholders or matching front granularity? 
    // User said "Enough detail". Logic in previous file was full blocks.
    // Let's use the rects from BodyBack.tsx which were working fine.
    { id: 'back_upperarm_l', type: 'rect', x: 300, y: 390, w: 110, h: 210, rx: 44, offset: -70 },
    { id: 'back_upperarm_r', type: 'rect', x: 614, y: 390, w: 110, h: 210, rx: 44, offset: 70 },

    // Forearms Back (Using special offsets from BodyBack.tsx if any?)
    // BodyBack.tsx used: Left: (-77, -175), Right: (77, -175)
    // Formula applies custom offsets.
    { id: 'back_forearm_l', type: 'rect', x: 300, y: 670, w: 110, h: 310, rx: 44, customX: -77, customY: -175 },
    { id: 'back_forearm_r', type: 'rect', x: 614, y: 670, w: 110, h: 310, rx: 44, customX: 77, customY: -175 },

    // Hands Back (Using special offsets)
    // BodyBack.tsx used: Left (-113, -200, scale 0.55), Right (113, -200, scale 0.55)
    { id: 'back_hand_l', type: 'rect', x: 290, y: 1020, w: 130, h: 200, rx: 36, customX: -113, customY: -200, scale: 0.55 },
    { id: 'back_hand_r', type: 'rect', x: 604, y: 1020, w: 130, h: 200, rx: 36, customX: 113, customY: -200, scale: 0.55 },

    // --- LEGS BACK (Offset +/- 20) ---
    { id: 'thigh_back_l', type: 'rect', x: 410, y: 860, w: 140, h: 220, rx: 50, offset: -20 },
    { id: 'thigh_back_r', type: 'rect', x: 474, y: 860, w: 140, h: 220, rx: 50, offset: 20 },

    { id: 'knee_back_l', type: 'rect', x: 430, y: 1080, w: 110, h: 80, rx: 26, offset: -20 },
    { id: 'knee_back_r', type: 'rect', x: 484, y: 1080, w: 110, h: 80, rx: 26, offset: 20 },

    { id: 'calf_back_l', type: 'rect', x: 420, y: 1160, w: 120, h: 170, rx: 55, offset: -20 },
    { id: 'calf_back_r', type: 'rect', x: 484, y: 1160, w: 120, h: 170, rx: 55, offset: 20 },

    { id: 'back_ankle_l', type: 'rect', x: 438, y: 1330, w: 90, h: 35, rx: 14, offset: -20 },
    { id: 'back_ankle_r', type: 'rect', x: 496, y: 1330, w: 90, h: 35, rx: 14, offset: 20 },

    { id: 'back_foot_l', type: 'path', d: "M410 1365 L520 1365 L540 1388 Q490 1404 420 1390 Z", offset: -20 },
    { id: 'back_foot_r', type: 'path', d: "M504 1365 L614 1365 L604 1390 Q534 1404 484 1388 Z", offset: 20 },
];


// --- MAPPING 50 -> 24 ---
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
        const cx = 512;
        const cy = 682.5;

        // Custom transform logic matches implementation plan
        const applyCustom = (x, y) => {
            if (item.customX !== undefined) {
                const nx = (x - cx) * scale + cx + item.customX;
                const ny = (y - cy) * scale + cy + item.customY;
                return { x: Math.round(nx), y: Math.round(ny) };
            } else {
                return transformPoint(x, y, item.offset);
            }
        };

        let svgEl = '';
        if (item.type === 'rect') {
            const { x, y } = applyCustom(item.x, item.y);
            const w = Math.round(item.w * scale);
            const h = Math.round(item.h * scale);
            const rx = Math.round(item.rx * scale);
            svgEl = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" />`;
        } else if (item.type === 'ellipse') {
            const { x: cx_new, y: cy_new } = applyCustom(item.cx, item.cy);
            const rx = Math.round(item.rx * scale);
            const ry = Math.round(item.ry * scale);
            svgEl = `<ellipse cx="${cx_new}" cy="${cy_new}" rx="${rx}" ry="${ry}" />`;
        } else if (item.type === 'path') {
            const newD = item.d.replace(/([A-Z])\s*([^A-Z]+)/g, (match, command, args) => {
                const nums = args.trim().split(/[\s,]+/).map(Number);
                const newNums = [];
                for (let i = 0; i < nums.length; i += 2) {
                    const { x, y } = applyCustom(nums[i], nums[i + 1]);
                    newNums.push(x, y);
                }
                return command + newNums.join(' ');
            });
            svgEl = `<path d="${newD}" />`;
        }
        processedItems[item.id] = svgEl;
    });

    // 2. Output Groups
    Object.entries(groupMap).forEach(([groupId, subIds]) => {
        const title = LABELS[groupId] || groupId;
        console.log(`<g data-zone="${groupId}" data-label="${title}" className={isSel("${groupId}")}>`);
        console.log(`  <title>${title}</title>`);
        subIds.forEach(subId => {
            if (processedItems[subId]) {
                console.log(`  ${processedItems[subId]}`);
            } else {
                console.warn(`WARNING: Missing subId ${subId} for group ${groupId}`);
            }
        });
        console.log(`</g>`);
    });
}

