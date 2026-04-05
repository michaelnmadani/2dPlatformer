const Levels = {
    CLOTHING_NAMES: [
        'Naked Frog',
        'Royal Crown',
        'Bowtie',
        'Purple Vest',
        'Royal Cape',
        'Blue Pants',
        'Leather Boots',
        'White Gloves',
        'Golden Scepter',
        'Full King Regalia'
    ],

    WATER_LEVEL: 430,

    get(levelNum) {
        const configs = {
            // Level 1 — Tutorial (Easy)
            1: {
                level: 1,
                lilypads: [
                    { x: 80,  y: 400, width: 100, type: 'static' },
                    { x: 200, y: 400, width: 95,  type: 'static' },
                    { x: 320, y: 400, width: 90,  type: 'static' },
                    { x: 440, y: 400, width: 95,  type: 'static' },
                    { x: 560, y: 400, width: 90,  type: 'static' },
                    { x: 680, y: 400, width: 100, type: 'static' },
                    { x: 1090, y: 400, width: 80,  type: 'static' }
                ],
                dragonflies: [],
                prince: { x: 1100, y: 355 },
                wind: { force: 0, interval: 0, duration: 0 },
                startX: 105,
                startY: 370,
                levelWidth: 1200
            },

            // Level 2 — Varied Gaps
            2: {
                level: 2,
                lilypads: [
                    { x: 80,  y: 400, width: 90,  type: 'static' },
                    { x: 210, y: 395, width: 80,  type: 'static' },
                    { x: 370, y: 385, width: 75,  type: 'static' },
                    { x: 510, y: 400, width: 85,  type: 'static' },
                    { x: 650, y: 380, width: 70,  type: 'static' },
                    { x: 810, y: 395, width: 80,  type: 'static' },
                    { x: 940, y: 410, width: 90,  type: 'static' },
                    { x: 1290, y: 400, width: 80,  type: 'static' }
                ],
                dragonflies: [],
                prince: { x: 1300, y: 355 },
                wind: { force: 0, interval: 0, duration: 0 },
                startX: 105,
                startY: 370,
                levelWidth: 1400
            },

            // Level 3 — Moving Pads
            3: {
                level: 3,
                lilypads: [
                    { x: 80,  y: 400, width: 85,  type: 'static' },
                    { x: 220, y: 395, width: 75,  type: 'static' },
                    { x: 380, y: 390, width: 70,  type: 'moving', moveSpeed: 0.8, moveRange: 45 },
                    { x: 520, y: 400, width: 80,  type: 'static' },
                    { x: 680, y: 385, width: 65,  type: 'moving', moveSpeed: 1.0, moveRange: 50 },
                    { x: 840, y: 395, width: 75,  type: 'static' },
                    { x: 990, y: 390, width: 70,  type: 'moving', moveSpeed: 1.2, moveRange: 60 },
                    { x: 1150, y: 400, width: 80, type: 'static' },
                    { x: 1490, y: 400, width: 80, type: 'static' }
                ],
                dragonflies: [],
                prince: { x: 1500, y: 355 },
                wind: { force: 0, interval: 0, duration: 0 },
                startX: 105,
                startY: 370,
                levelWidth: 1600
            },

            // Level 4 — Sinking Pads
            4: {
                level: 4,
                lilypads: [
                    { x: 80,  y: 400, width: 80,  type: 'static' },
                    { x: 230, y: 395, width: 70,  type: 'sinking' },
                    { x: 390, y: 400, width: 75,  type: 'static' },
                    { x: 540, y: 385, width: 60,  type: 'sinking' },
                    { x: 710, y: 400, width: 70,  type: 'static' },
                    { x: 870, y: 390, width: 55,  type: 'sinking' },
                    { x: 1040, y: 400, width: 75, type: 'static' },
                    { x: 1190, y: 395, width: 80, type: 'static' },
                    { x: 1490, y: 400, width: 80, type: 'static' }
                ],
                dragonflies: [],
                prince: { x: 1500, y: 355 },
                wind: { force: 0, interval: 0, duration: 0 },
                startX: 105,
                startY: 370,
                levelWidth: 1600
            },

            // Level 5 — Dragonflies!
            5: {
                level: 5,
                lilypads: [
                    { x: 80,  y: 400, width: 75,  type: 'static' },
                    { x: 220, y: 390, width: 65,  type: 'static' },
                    { x: 370, y: 395, width: 70,  type: 'moving', moveSpeed: 0.9, moveRange: 45 },
                    { x: 530, y: 400, width: 60,  type: 'static' },
                    { x: 680, y: 385, width: 55,  type: 'moving', moveSpeed: 1.0, moveRange: 50 },
                    { x: 840, y: 395, width: 70,  type: 'static' },
                    { x: 1000, y: 390, width: 65, type: 'static' },
                    { x: 1160, y: 400, width: 60, type: 'moving', moveSpeed: 1.1, moveRange: 55 },
                    { x: 1320, y: 395, width: 70, type: 'static' },
                    { x: 1690, y: 400, width: 80, type: 'static' }
                ],
                dragonflies: [
                    { x: 350, y: 320, patrolRange: 100 },
                    { x: 700, y: 300, patrolRange: 120 },
                    { x: 1050, y: 310, patrolRange: 80 }
                ],
                prince: { x: 1700, y: 355 },
                wind: { force: 0, interval: 0, duration: 0 },
                startX: 105,
                startY: 370,
                levelWidth: 1800
            },

            // Level 6 — Wind
            6: {
                level: 6,
                lilypads: [
                    { x: 80,  y: 400, width: 70,  type: 'static' },
                    { x: 220, y: 395, width: 65,  type: 'static' },
                    { x: 370, y: 390, width: 60,  type: 'moving', moveSpeed: 0.9, moveRange: 40 },
                    { x: 520, y: 400, width: 55,  type: 'static' },
                    { x: 680, y: 385, width: 65,  type: 'moving', moveSpeed: 1.0, moveRange: 50 },
                    { x: 840, y: 400, width: 60,  type: 'static' },
                    { x: 990, y: 390, width: 50,  type: 'static' },
                    { x: 1140, y: 395, width: 65, type: 'moving', moveSpeed: 1.1, moveRange: 55 },
                    { x: 1300, y: 400, width: 70, type: 'static' },
                    { x: 1690, y: 400, width: 80, type: 'static' }
                ],
                dragonflies: [],
                prince: { x: 1700, y: 355 },
                wind: { force: 2, interval: 180, duration: 120 },
                startX: 105,
                startY: 370,
                levelWidth: 1800
            },

            // Level 7 — Moving + Sinking Combo
            7: {
                level: 7,
                lilypads: [
                    { x: 80,  y: 400, width: 70,  type: 'static' },
                    { x: 230, y: 390, width: 60,  type: 'moving', moveSpeed: 1.0, moveRange: 45 },
                    { x: 390, y: 400, width: 55,  type: 'sinking' },
                    { x: 540, y: 385, width: 65,  type: 'static' },
                    { x: 700, y: 395, width: 50,  type: 'moving', moveSpeed: 1.2, moveRange: 55 },
                    { x: 860, y: 400, width: 60,  type: 'sinking' },
                    { x: 1010, y: 390, width: 45, type: 'moving', moveSpeed: 1.1, moveRange: 50 },
                    { x: 1170, y: 400, width: 55, type: 'sinking' },
                    { x: 1330, y: 395, width: 65, type: 'static' },
                    { x: 1490, y: 400, width: 70, type: 'static' },
                    { x: 1890, y: 400, width: 80, type: 'static' }
                ],
                dragonflies: [
                    { x: 500, y: 310, patrolRange: 100 },
                    { x: 1000, y: 290, patrolRange: 110 }
                ],
                prince: { x: 1900, y: 355 },
                wind: { force: 0, interval: 0, duration: 0 },
                startX: 105,
                startY: 370,
                levelWidth: 2000
            },

            // Level 8 — Fast Moving
            8: {
                level: 8,
                lilypads: [
                    { x: 80,  y: 400, width: 65,  type: 'static' },
                    { x: 240, y: 390, width: 55,  type: 'moving', moveSpeed: 1.8, moveRange: 70 },
                    { x: 420, y: 400, width: 50,  type: 'static' },
                    { x: 590, y: 385, width: 60,  type: 'moving', moveSpeed: 1.5, moveRange: 60 },
                    { x: 760, y: 395, width: 45,  type: 'static' },
                    { x: 930, y: 390, width: 55,  type: 'moving', moveSpeed: 2.0, moveRange: 80 },
                    { x: 1110, y: 400, width: 40, type: 'static' },
                    { x: 1280, y: 385, width: 50, type: 'moving', moveSpeed: 1.7, moveRange: 65 },
                    { x: 1460, y: 400, width: 60, type: 'static' },
                    { x: 1640, y: 395, width: 55, type: 'static' },
                    { x: 2090, y: 400, width: 80, type: 'static' }
                ],
                dragonflies: [
                    { x: 600, y: 300, patrolRange: 100 },
                    { x: 1200, y: 280, patrolRange: 110 }
                ],
                prince: { x: 2100, y: 355 },
                wind: { force: 1.5, interval: 240, duration: 90 },
                startX: 105,
                startY: 370,
                levelWidth: 2200
            },

            // Level 9 — Disappearing Pads
            9: {
                level: 9,
                lilypads: [
                    { x: 80,  y: 400, width: 60,  type: 'static' },
                    { x: 240, y: 390, width: 50,  type: 'disappearing' },
                    { x: 400, y: 400, width: 55,  type: 'moving', moveSpeed: 1.2, moveRange: 50 },
                    { x: 560, y: 385, width: 45,  type: 'sinking' },
                    { x: 720, y: 395, width: 55,  type: 'static' },
                    { x: 880, y: 390, width: 40,  type: 'disappearing' },
                    { x: 1040, y: 400, width: 50, type: 'moving', moveSpeed: 1.3, moveRange: 55 },
                    { x: 1200, y: 385, width: 45, type: 'sinking' },
                    { x: 1370, y: 395, width: 55, type: 'disappearing' },
                    { x: 1540, y: 400, width: 50, type: 'static' },
                    { x: 1710, y: 390, width: 60, type: 'static' },
                    { x: 2290, y: 400, width: 80, type: 'static' }
                ],
                dragonflies: [
                    { x: 450, y: 310, patrolRange: 90 },
                    { x: 900, y: 290, patrolRange: 110 },
                    { x: 1400, y: 300, patrolRange: 100 }
                ],
                prince: { x: 2300, y: 355 },
                wind: { force: 0, interval: 0, duration: 0 },
                startX: 105,
                startY: 370,
                levelWidth: 2400
            },

            // Level 10 — Everything Combined (Boss Level)
            10: {
                level: 10,
                lilypads: [
                    { x: 80,  y: 400, width: 60,  type: 'static' },
                    { x: 260, y: 390, width: 45,  type: 'moving', moveSpeed: 1.8, moveRange: 70 },
                    { x: 440, y: 400, width: 50,  type: 'sinking' },
                    { x: 610, y: 385, width: 40,  type: 'disappearing' },
                    { x: 780, y: 395, width: 55,  type: 'static' },
                    { x: 960, y: 390, width: 35,  type: 'moving', moveSpeed: 2.0, moveRange: 75 },
                    { x: 1140, y: 400, width: 45, type: 'sinking' },
                    { x: 1310, y: 385, width: 40, type: 'disappearing' },
                    { x: 1490, y: 395, width: 50, type: 'static' },
                    { x: 1670, y: 390, width: 45, type: 'moving', moveSpeed: 1.9, moveRange: 65 },
                    { x: 1850, y: 400, width: 40, type: 'sinking' },
                    { x: 2030, y: 385, width: 55, type: 'disappearing' },
                    { x: 2690, y: 400, width: 80, type: 'static' }
                ],
                dragonflies: [
                    { x: 400, y: 300, patrolRange: 110 },
                    { x: 800, y: 280, patrolRange: 120 },
                    { x: 1300, y: 290, patrolRange: 100 },
                    { x: 1800, y: 270, patrolRange: 115 }
                ],
                prince: { x: 2700, y: 355 },
                wind: { force: 2.5, interval: 150, duration: 100 },
                startX: 105,
                startY: 370,
                levelWidth: 2800
            }
        };

        return configs[levelNum] || null;
    }
};
