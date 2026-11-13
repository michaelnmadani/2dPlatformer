const Levels = {
    CLOTHING_NAMES: [
        'Naked Frog',
        'Royal Crown',
        'Bowtie',
        'Monocle',
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
            // Level 1 — Tutorial (Easy) ~3600 wide
            1: {
                level: 1,
                lilypads: [
                    { x: 80,   y: 400, width: 100, type: 'static' },
                    { x: 220,  y: 400, width: 95,  type: 'static' },
                    { x: 370,  y: 400, width: 90,  type: 'static' },
                    { x: 510,  y: 400, width: 95,  type: 'static' },
                    { x: 650,  y: 400, width: 90,  type: 'static' },
                    { x: 790,  y: 400, width: 100, type: 'static' },
                    { x: 930,  y: 400, width: 95,  type: 'static' },
                    { x: 1070, y: 400, width: 90,  type: 'static' },
                    { x: 1210, y: 400, width: 95,  type: 'static' },
                    { x: 1350, y: 400, width: 90,  type: 'static' },
                    { x: 1490, y: 400, width: 100, type: 'static' },
                    { x: 1630, y: 400, width: 95,  type: 'static' },
                    { x: 1770, y: 400, width: 90,  type: 'static' },
                    { x: 1910, y: 400, width: 95,  type: 'static' },
                    { x: 2050, y: 400, width: 90,  type: 'static' },
                    { x: 2190, y: 400, width: 100, type: 'static' },
                    { x: 2330, y: 400, width: 95,  type: 'static' },
                    { x: 2470, y: 400, width: 90,  type: 'static' },
                    // Final pad under prince
                    { x: 2830, y: 400, width: 80,  type: 'static' }
                ],
                dragonflies: [],
                prince: { x: 2830, y: 355 },
                wind: { force: 0, interval: 0, duration: 0 },
                startX: 105,
                startY: 370,
                levelWidth: 3100,
                scene: 0
            },

            // Level 2 — Varied Gaps ~4200 wide
            2: {
                level: 2,
                lilypads: [
                    { x: 80,   y: 400, width: 90,  type: 'static' },
                    { x: 220,  y: 395, width: 80,  type: 'static' },
                    { x: 390,  y: 385, width: 75,  type: 'static' },
                    { x: 540,  y: 400, width: 85,  type: 'static' },
                    { x: 690,  y: 380, width: 70,  type: 'static' },
                    { x: 850,  y: 395, width: 80,  type: 'static' },
                    { x: 990,  y: 410, width: 90,  type: 'static' },
                    { x: 1140, y: 395, width: 80,  type: 'static' },
                    { x: 1310, y: 385, width: 75,  type: 'static' },
                    { x: 1460, y: 400, width: 85,  type: 'static' },
                    { x: 1610, y: 390, width: 70,  type: 'static' },
                    { x: 1770, y: 400, width: 80,  type: 'static' },
                    { x: 1920, y: 385, width: 75,  type: 'static' },
                    { x: 2080, y: 395, width: 85,  type: 'static' },
                    { x: 2230, y: 400, width: 80,  type: 'static' },
                    { x: 2400, y: 380, width: 70,  type: 'static' },
                    { x: 2560, y: 395, width: 85,  type: 'static' },
                    { x: 2710, y: 400, width: 80,  type: 'static' },
                    { x: 2870, y: 390, width: 75,  type: 'static' },
                    { x: 3020, y: 400, width: 90,  type: 'static' },
                    // Final pad under prince
                    { x: 3355, y: 400, width: 80,  type: 'static' }
                ],
                dragonflies: [],
                prince: { x: 3355, y: 355 },
                wind: { force: 0, interval: 0, duration: 0 },
                startX: 105,
                startY: 370,
                levelWidth: 3600,
                scene: 1
            },

            // Level 3 — Moving Pads ~4800 wide
            3: {
                level: 3,
                lilypads: [
                    { x: 80,   y: 400, width: 85,  type: 'static' },
                    { x: 230,  y: 395, width: 75,  type: 'static' },
                    { x: 400,  y: 390, width: 70,  type: 'moving', moveSpeed: 0.8, moveRange: 45 },
                    { x: 560,  y: 400, width: 80,  type: 'static' },
                    { x: 720,  y: 385, width: 65,  type: 'moving', moveSpeed: 1.0, moveRange: 50 },
                    { x: 880,  y: 395, width: 75,  type: 'static' },
                    { x: 1040, y: 390, width: 70,  type: 'moving', moveSpeed: 1.2, moveRange: 60 },
                    { x: 1200, y: 400, width: 80,  type: 'static' },
                    { x: 1360, y: 395, width: 75,  type: 'static' },
                    { x: 1520, y: 390, width: 70,  type: 'moving', moveSpeed: 0.9, moveRange: 40 },
                    { x: 1680, y: 400, width: 80,  type: 'static' },
                    { x: 1840, y: 385, width: 65,  type: 'moving', moveSpeed: 1.1, moveRange: 55 },
                    { x: 2000, y: 395, width: 75,  type: 'static' },
                    { x: 2160, y: 400, width: 80,  type: 'static' },
                    { x: 2320, y: 390, width: 70,  type: 'moving', moveSpeed: 0.8, moveRange: 45 },
                    { x: 2480, y: 395, width: 75,  type: 'static' },
                    { x: 2640, y: 400, width: 80,  type: 'static' },
                    { x: 2800, y: 385, width: 65,  type: 'moving', moveSpeed: 1.0, moveRange: 50 },
                    { x: 2960, y: 400, width: 75,  type: 'static' },
                    { x: 3120, y: 395, width: 80,  type: 'static' },
                    { x: 3280, y: 390, width: 70,  type: 'moving', moveSpeed: 1.2, moveRange: 55 },
                    { x: 3440, y: 400, width: 80,  type: 'static' },
                    // Final pad under prince
                    { x: 3815, y: 400, width: 80,  type: 'static' }
                ],
                dragonflies: [],
                prince: { x: 3815, y: 355 },
                wind: { force: 0, interval: 0, duration: 0 },
                startX: 105,
                startY: 370,
                levelWidth: 4100,
                scene: 2
            },

            // Level 4 — Sinking Pads ~4800 wide
            4: {
                level: 4,
                lilypads: [
                    { x: 80,   y: 400, width: 80,  type: 'static' },
                    { x: 240,  y: 395, width: 70,  type: 'sinking' },
                    { x: 410,  y: 400, width: 75,  type: 'static' },
                    { x: 570,  y: 385, width: 60,  type: 'sinking' },
                    { x: 740,  y: 400, width: 70,  type: 'static' },
                    { x: 900,  y: 390, width: 55,  type: 'sinking' },
                    { x: 1070, y: 400, width: 75,  type: 'static' },
                    { x: 1230, y: 395, width: 80,  type: 'static' },
                    { x: 1390, y: 400, width: 70,  type: 'sinking' },
                    { x: 1550, y: 385, width: 75,  type: 'static' },
                    { x: 1710, y: 395, width: 60,  type: 'sinking' },
                    { x: 1880, y: 400, width: 70,  type: 'static' },
                    { x: 2040, y: 390, width: 75,  type: 'static' },
                    { x: 2200, y: 400, width: 55,  type: 'sinking' },
                    { x: 2370, y: 395, width: 70,  type: 'static' },
                    { x: 2530, y: 385, width: 65,  type: 'sinking' },
                    { x: 2700, y: 400, width: 75,  type: 'static' },
                    { x: 2860, y: 400, width: 80,  type: 'static' },
                    { x: 3020, y: 390, width: 70,  type: 'sinking' },
                    { x: 3190, y: 400, width: 75,  type: 'static' },
                    { x: 3350, y: 395, width: 80,  type: 'static' },
                    // Final pad under prince
                    { x: 3720, y: 400, width: 80,  type: 'static' }
                ],
                dragonflies: [],
                prince: { x: 3720, y: 355 },
                wind: { force: 0, interval: 0, duration: 0 },
                startX: 105,
                startY: 370,
                levelWidth: 4000,
                scene: 3
            },

            // Level 5 — Dragonflies! ~5400 wide
            5: {
                level: 5,
                lilypads: [
                    { x: 80,   y: 400, width: 75,  type: 'static' },
                    { x: 230,  y: 390, width: 65,  type: 'static' },
                    { x: 390,  y: 395, width: 70,  type: 'moving', moveSpeed: 0.9, moveRange: 45 },
                    { x: 550,  y: 400, width: 60,  type: 'static' },
                    { x: 710,  y: 385, width: 55,  type: 'moving', moveSpeed: 1.0, moveRange: 50 },
                    { x: 870,  y: 395, width: 70,  type: 'static' },
                    { x: 1030, y: 390, width: 65,  type: 'static' },
                    { x: 1190, y: 400, width: 60,  type: 'moving', moveSpeed: 1.1, moveRange: 55 },
                    { x: 1350, y: 395, width: 70,  type: 'static' },
                    { x: 1510, y: 385, width: 65,  type: 'static' },
                    { x: 1670, y: 400, width: 70,  type: 'moving', moveSpeed: 0.8, moveRange: 45 },
                    { x: 1830, y: 390, width: 60,  type: 'static' },
                    { x: 1990, y: 395, width: 55,  type: 'moving', moveSpeed: 1.0, moveRange: 50 },
                    { x: 2150, y: 400, width: 70,  type: 'static' },
                    { x: 2310, y: 385, width: 65,  type: 'static' },
                    { x: 2470, y: 395, width: 60,  type: 'moving', moveSpeed: 1.1, moveRange: 55 },
                    { x: 2630, y: 400, width: 70,  type: 'static' },
                    { x: 2790, y: 390, width: 65,  type: 'static' },
                    { x: 2950, y: 400, width: 70,  type: 'static' },
                    { x: 3110, y: 385, width: 60,  type: 'moving', moveSpeed: 0.9, moveRange: 45 },
                    { x: 3270, y: 395, width: 70,  type: 'static' },
                    { x: 3430, y: 400, width: 65,  type: 'static' },
                    { x: 3590, y: 390, width: 70,  type: 'static' },
                    { x: 3750, y: 400, width: 75,  type: 'static' },
                    // Final pad under prince
                    { x: 4190, y: 400, width: 80,  type: 'static' }
                ],
                dragonflies: [
                    { x: 370,  y: 320, patrolRange: 100 },
                    { x: 730,  y: 300, patrolRange: 120 },
                    { x: 1100, y: 310, patrolRange: 80 },
                    { x: 1700, y: 300, patrolRange: 110 },
                    { x: 2200, y: 320, patrolRange: 90 },
                    { x: 2800, y: 290, patrolRange: 100 },
                    { x: 3400, y: 310, patrolRange: 110 }
                ],
                prince: { x: 4190, y: 355 },
                wind: { force: 0, interval: 0, duration: 0 },
                startX: 105,
                startY: 370,
                levelWidth: 4500,
                scene: 4
            },

            // Level 6 — Wind ~5400 wide
            6: {
                level: 6,
                lilypads: [
                    { x: 80,   y: 400, width: 70,  type: 'static' },
                    { x: 230,  y: 395, width: 65,  type: 'static' },
                    { x: 390,  y: 390, width: 60,  type: 'moving', moveSpeed: 0.9, moveRange: 40 },
                    { x: 550,  y: 400, width: 55,  type: 'static' },
                    { x: 710,  y: 385, width: 65,  type: 'moving', moveSpeed: 1.0, moveRange: 50 },
                    { x: 870,  y: 400, width: 60,  type: 'static' },
                    { x: 1030, y: 390, width: 50,  type: 'static' },
                    { x: 1190, y: 395, width: 65,  type: 'moving', moveSpeed: 1.1, moveRange: 55 },
                    { x: 1350, y: 400, width: 70,  type: 'static' },
                    { x: 1510, y: 385, width: 60,  type: 'static' },
                    { x: 1670, y: 395, width: 55,  type: 'moving', moveSpeed: 0.8, moveRange: 40 },
                    { x: 1830, y: 400, width: 65,  type: 'static' },
                    { x: 1990, y: 390, width: 60,  type: 'static' },
                    { x: 2150, y: 395, width: 65,  type: 'moving', moveSpeed: 1.0, moveRange: 50 },
                    { x: 2310, y: 400, width: 70,  type: 'static' },
                    { x: 2470, y: 385, width: 55,  type: 'static' },
                    { x: 2630, y: 400, width: 60,  type: 'moving', moveSpeed: 1.1, moveRange: 45 },
                    { x: 2790, y: 395, width: 65,  type: 'static' },
                    { x: 2950, y: 400, width: 70,  type: 'static' },
                    { x: 3110, y: 390, width: 55,  type: 'moving', moveSpeed: 0.9, moveRange: 50 },
                    { x: 3270, y: 400, width: 65,  type: 'static' },
                    { x: 3430, y: 395, width: 60,  type: 'static' },
                    { x: 3590, y: 400, width: 70,  type: 'static' },
                    // Final pad under prince
                    { x: 4030, y: 400, width: 80,  type: 'static' }
                ],
                dragonflies: [],
                prince: { x: 4030, y: 355 },
                wind: { force: 2, interval: 180, duration: 120 },
                startX: 105,
                startY: 370,
                levelWidth: 4300,
                scene: 5
            },

            // Level 7 — Moving + Sinking Combo ~6000 wide
            7: {
                level: 7,
                lilypads: [
                    { x: 80,   y: 400, width: 70,  type: 'static' },
                    { x: 240,  y: 390, width: 60,  type: 'moving', moveSpeed: 1.0, moveRange: 45 },
                    { x: 410,  y: 400, width: 55,  type: 'sinking' },
                    { x: 570,  y: 385, width: 65,  type: 'static' },
                    { x: 730,  y: 395, width: 50,  type: 'moving', moveSpeed: 1.2, moveRange: 55 },
                    { x: 900,  y: 400, width: 60,  type: 'sinking' },
                    { x: 1060, y: 390, width: 45,  type: 'moving', moveSpeed: 1.1, moveRange: 50 },
                    { x: 1220, y: 400, width: 55,  type: 'sinking' },
                    { x: 1380, y: 395, width: 65,  type: 'static' },
                    { x: 1540, y: 400, width: 70,  type: 'static' },
                    { x: 1700, y: 390, width: 55,  type: 'moving', moveSpeed: 1.0, moveRange: 45 },
                    { x: 1860, y: 400, width: 60,  type: 'sinking' },
                    { x: 2020, y: 385, width: 65,  type: 'static' },
                    { x: 2180, y: 395, width: 50,  type: 'moving', moveSpeed: 1.2, moveRange: 50 },
                    { x: 2340, y: 400, width: 55,  type: 'sinking' },
                    { x: 2500, y: 390, width: 60,  type: 'static' },
                    { x: 2660, y: 400, width: 65,  type: 'static' },
                    { x: 2820, y: 385, width: 50,  type: 'moving', moveSpeed: 1.1, moveRange: 55 },
                    { x: 2980, y: 395, width: 55,  type: 'sinking' },
                    { x: 3140, y: 400, width: 65,  type: 'static' },
                    { x: 3300, y: 390, width: 60,  type: 'moving', moveSpeed: 1.0, moveRange: 45 },
                    { x: 3460, y: 400, width: 70,  type: 'static' },
                    { x: 3620, y: 395, width: 55,  type: 'sinking' },
                    { x: 3780, y: 400, width: 65,  type: 'static' },
                    { x: 3940, y: 390, width: 70,  type: 'static' },
                    // Final pad under prince
                    { x: 4415, y: 400, width: 80,  type: 'static' }
                ],
                dragonflies: [
                    { x: 500,  y: 310, patrolRange: 100 },
                    { x: 1000, y: 290, patrolRange: 110 },
                    { x: 1800, y: 300, patrolRange: 100 },
                    { x: 2600, y: 310, patrolRange: 110 },
                    { x: 3400, y: 290, patrolRange: 100 }
                ],
                prince: { x: 4415, y: 355 },
                wind: { force: 0, interval: 0, duration: 0 },
                startX: 105,
                startY: 370,
                levelWidth: 4700,
                scene: 6
            },

            // Level 8 — Fast Moving ~6600 wide
            8: {
                level: 8,
                lilypads: [
                    { x: 80,   y: 400, width: 65,  type: 'static' },
                    { x: 250,  y: 390, width: 55,  type: 'moving', moveSpeed: 1.8, moveRange: 70 },
                    { x: 440,  y: 400, width: 50,  type: 'static' },
                    { x: 620,  y: 385, width: 60,  type: 'moving', moveSpeed: 1.5, moveRange: 60 },
                    { x: 800,  y: 395, width: 45,  type: 'static' },
                    { x: 980,  y: 390, width: 55,  type: 'moving', moveSpeed: 2.0, moveRange: 80 },
                    { x: 1160, y: 400, width: 40,  type: 'static' },
                    { x: 1340, y: 385, width: 50,  type: 'moving', moveSpeed: 1.7, moveRange: 65 },
                    { x: 1520, y: 400, width: 60,  type: 'static' },
                    { x: 1700, y: 395, width: 55,  type: 'static' },
                    { x: 1870, y: 390, width: 50,  type: 'moving', moveSpeed: 1.8, moveRange: 70 },
                    { x: 2050, y: 400, width: 45,  type: 'static' },
                    { x: 2230, y: 385, width: 55,  type: 'moving', moveSpeed: 1.6, moveRange: 60 },
                    { x: 2410, y: 395, width: 50,  type: 'static' },
                    { x: 2590, y: 400, width: 60,  type: 'moving', moveSpeed: 2.0, moveRange: 75 },
                    { x: 2770, y: 390, width: 45,  type: 'static' },
                    { x: 2950, y: 385, width: 55,  type: 'moving', moveSpeed: 1.7, moveRange: 65 },
                    { x: 3130, y: 400, width: 50,  type: 'static' },
                    { x: 3310, y: 395, width: 60,  type: 'static' },
                    { x: 3490, y: 390, width: 50,  type: 'moving', moveSpeed: 1.9, moveRange: 70 },
                    { x: 3670, y: 400, width: 55,  type: 'static' },
                    { x: 3850, y: 385, width: 50,  type: 'moving', moveSpeed: 1.6, moveRange: 60 },
                    { x: 4030, y: 400, width: 60,  type: 'static' },
                    { x: 4210, y: 395, width: 55,  type: 'static' },
                    { x: 4390, y: 390, width: 50,  type: 'moving', moveSpeed: 2.0, moveRange: 75 },
                    { x: 4570, y: 400, width: 60,  type: 'static' },
                    // Final pad under prince
                    { x: 5040, y: 400, width: 80,  type: 'static' }
                ],
                dragonflies: [
                    { x: 600,  y: 300, patrolRange: 100 },
                    { x: 1200, y: 280, patrolRange: 110 },
                    { x: 2000, y: 300, patrolRange: 100 },
                    { x: 2800, y: 290, patrolRange: 110 },
                    { x: 3600, y: 300, patrolRange: 100 },
                    { x: 4400, y: 280, patrolRange: 110 }
                ],
                prince: { x: 5040, y: 355 },
                wind: { force: 1.5, interval: 240, duration: 90 },
                startX: 105,
                startY: 370,
                levelWidth: 5300,
                scene: 7
            },

            // Level 9 — Disappearing Pads ~7200 wide
            9: {
                level: 9,
                lilypads: [
                    { x: 80,   y: 400, width: 60,  type: 'static' },
                    { x: 250,  y: 390, width: 50,  type: 'disappearing' },
                    { x: 420,  y: 400, width: 55,  type: 'moving', moveSpeed: 1.2, moveRange: 50 },
                    { x: 590,  y: 385, width: 45,  type: 'sinking' },
                    { x: 760,  y: 395, width: 55,  type: 'static' },
                    { x: 930,  y: 390, width: 40,  type: 'disappearing' },
                    { x: 1100, y: 400, width: 50,  type: 'moving', moveSpeed: 1.3, moveRange: 55 },
                    { x: 1270, y: 385, width: 45,  type: 'sinking' },
                    { x: 1440, y: 395, width: 55,  type: 'disappearing' },
                    { x: 1610, y: 400, width: 50,  type: 'static' },
                    { x: 1780, y: 390, width: 60,  type: 'static' },
                    { x: 1950, y: 385, width: 50,  type: 'disappearing' },
                    { x: 2120, y: 400, width: 55,  type: 'moving', moveSpeed: 1.1, moveRange: 50 },
                    { x: 2290, y: 390, width: 45,  type: 'sinking' },
                    { x: 2460, y: 395, width: 55,  type: 'static' },
                    { x: 2630, y: 400, width: 40,  type: 'disappearing' },
                    { x: 2800, y: 385, width: 50,  type: 'moving', moveSpeed: 1.3, moveRange: 55 },
                    { x: 2970, y: 400, width: 45,  type: 'sinking' },
                    { x: 3140, y: 395, width: 55,  type: 'disappearing' },
                    { x: 3310, y: 400, width: 50,  type: 'static' },
                    { x: 3480, y: 390, width: 60,  type: 'static' },
                    { x: 3650, y: 385, width: 50,  type: 'disappearing' },
                    { x: 3820, y: 400, width: 55,  type: 'moving', moveSpeed: 1.2, moveRange: 50 },
                    { x: 3990, y: 395, width: 45,  type: 'sinking' },
                    { x: 4160, y: 400, width: 55,  type: 'static' },
                    { x: 4330, y: 390, width: 50,  type: 'disappearing' },
                    { x: 4500, y: 400, width: 55,  type: 'static' },
                    { x: 4670, y: 395, width: 60,  type: 'static' },
                    // Final pad under prince
                    { x: 5185, y: 400, width: 80,  type: 'static' }
                ],
                dragonflies: [
                    { x: 450,  y: 310, patrolRange: 90 },
                    { x: 900,  y: 290, patrolRange: 110 },
                    { x: 1400, y: 300, patrolRange: 100 },
                    { x: 2100, y: 310, patrolRange: 90 },
                    { x: 2700, y: 290, patrolRange: 110 },
                    { x: 3300, y: 300, patrolRange: 100 },
                    { x: 3900, y: 310, patrolRange: 90 },
                    { x: 4500, y: 290, patrolRange: 100 }
                ],
                prince: { x: 5185, y: 355 },
                wind: { force: 0, interval: 0, duration: 0 },
                startX: 105,
                startY: 370,
                levelWidth: 5400,
                scene: 8
            },

            // Level 10 — Everything Combined (Boss Level) ~8400 wide
            10: {
                level: 10,
                lilypads: [
                    { x: 80,   y: 400, width: 60,  type: 'static' },
                    { x: 270,  y: 390, width: 45,  type: 'moving', moveSpeed: 1.8, moveRange: 70 },
                    { x: 460,  y: 400, width: 50,  type: 'sinking' },
                    { x: 640,  y: 385, width: 40,  type: 'disappearing' },
                    { x: 820,  y: 395, width: 55,  type: 'static' },
                    { x: 1010, y: 390, width: 35,  type: 'moving', moveSpeed: 2.0, moveRange: 75 },
                    { x: 1200, y: 400, width: 45,  type: 'sinking' },
                    { x: 1380, y: 385, width: 40,  type: 'disappearing' },
                    { x: 1560, y: 395, width: 50,  type: 'static' },
                    { x: 1740, y: 390, width: 45,  type: 'moving', moveSpeed: 1.9, moveRange: 65 },
                    { x: 1920, y: 400, width: 40,  type: 'sinking' },
                    { x: 2100, y: 385, width: 55,  type: 'disappearing' },
                    { x: 2280, y: 400, width: 50,  type: 'static' },
                    { x: 2460, y: 390, width: 40,  type: 'moving', moveSpeed: 2.0, moveRange: 70 },
                    { x: 2640, y: 395, width: 45,  type: 'sinking' },
                    { x: 2820, y: 385, width: 40,  type: 'disappearing' },
                    { x: 3000, y: 400, width: 55,  type: 'static' },
                    { x: 3180, y: 390, width: 35,  type: 'moving', moveSpeed: 1.8, moveRange: 75 },
                    { x: 3360, y: 400, width: 45,  type: 'sinking' },
                    { x: 3540, y: 385, width: 40,  type: 'disappearing' },
                    { x: 3720, y: 395, width: 50,  type: 'static' },
                    { x: 3900, y: 390, width: 45,  type: 'moving', moveSpeed: 1.9, moveRange: 70 },
                    { x: 4080, y: 400, width: 40,  type: 'sinking' },
                    { x: 4260, y: 385, width: 55,  type: 'disappearing' },
                    { x: 4440, y: 400, width: 50,  type: 'static' },
                    { x: 4620, y: 390, width: 45,  type: 'moving', moveSpeed: 2.0, moveRange: 75 },
                    { x: 4800, y: 400, width: 40,  type: 'sinking' },
                    { x: 4980, y: 385, width: 50,  type: 'disappearing' },
                    { x: 5160, y: 395, width: 55,  type: 'static' },
                    { x: 5340, y: 400, width: 50,  type: 'static' },
                    { x: 5520, y: 390, width: 45,  type: 'moving', moveSpeed: 1.8, moveRange: 65 },
                    { x: 5700, y: 400, width: 55,  type: 'static' },
                    { x: 5880, y: 395, width: 50,  type: 'sinking' },
                    { x: 6060, y: 400, width: 60,  type: 'static' },
                    // Final pad under prince
                    { x: 6635, y: 400, width: 80,  type: 'static' }
                ],
                dragonflies: [
                    { x: 400,  y: 300, patrolRange: 110 },
                    { x: 800,  y: 280, patrolRange: 120 },
                    { x: 1300, y: 290, patrolRange: 100 },
                    { x: 1800, y: 270, patrolRange: 115 },
                    { x: 2400, y: 300, patrolRange: 110 },
                    { x: 3000, y: 280, patrolRange: 120 },
                    { x: 3600, y: 290, patrolRange: 100 },
                    { x: 4200, y: 270, patrolRange: 115 },
                    { x: 4800, y: 300, patrolRange: 110 },
                    { x: 5400, y: 280, patrolRange: 120 }
                ],
                prince: { x: 6635, y: 355 },
                wind: { force: 2.5, interval: 150, duration: 100 },
                startX: 105,
                startY: 370,
                levelWidth: 6900,
                scene: 9
            }
        };

        return configs[levelNum] || null;
    }
};
