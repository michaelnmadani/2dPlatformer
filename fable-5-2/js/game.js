/**
 * game.js - Main game loop, state machine, and input handling
 * for "The Frog Prince FABLE 5.2" — the enhanced-graphics edition.
 *
 * Depends on globals: Renderer (+ ui.js), Fx, Physics, Levels, Audio,
 * createFrog, createPrince, createLilypad, createDragonfly, createParticle
 */

const Game = {
    canvas: null,
    ctx: null,
    state: 'TITLE',
    currentLevel: 1,
    unlockedLevel: 1,
    lives: 5,
    maxLives: 5,
    hardcoreMode: false,
    _secretStep: 0,
    frog: null,
    prince: null,
    lilypads: [],
    dragonflies: [],
    fish: [],
    particles: [],
    cameraX: 0,
    levelWidth: 0,
    time: 0,
    keys: {
        left: false,
        right: false,
        up: false,
        space: false
    },
    levelButtons: [],
    // Wind
    windActive: false,
    windForce: 0,
    windTimer: 0,
    windConfig: null,
    // Campaign mode: advancing through levels keeps hearts across levels
    // Replay mode: replaying a single level from level select, no campaign penalty
    campaignMode: false,
    campaignLevel: 1,
    // Kiss cutscene
    kissProgress: 0,
    // Touch controls
    touchLeft: false,
    touchRight: false,
    touchJump: false,
    // Presentation state
    fade: 0,            // fade-in from black after a screen change
    shake: 0,           // screen shake frames remaining
    mouse: null,        // pointer position in view coordinates (hover)
    levelStartTime: 0,  // for the level intro banner
    hitTime: 0,         // when a heart was last lost (HUD pop)
    // Clock: `time` is the game clock (frozen while paused); the
    // simulation advances in fixed 60 Hz steps regardless of display rate
    paused: false,
    realTime: 0,
    stepTime: 0,
    _lastTs: 0,
    _acc: 0,
    // Forgiving jumps
    coyote: 0,          // frames after leaving a pad when a jump still works
    jumpBuffer: 0,      // frames a jump press is remembered before landing
    _jumpWas: false,
    windGrace: 0,       // calm frames after a (re)spawn
    // Collectibles, timer, checkpoint
    flies: [],
    fliesGot: 0,
    levelTime: 0,
    checkpoint: null,
    checkpointTime: -99999,
    lastResult: null,
    records: { stars: [], best: [] },
    touchUI: false,     // show on-screen buttons once a touch is seen

    // -------------------------------------------------------
    // Initialization
    // -------------------------------------------------------

    init() {
        this.canvas = document.getElementById('gameCanvas');
        // Render at device resolution (capped at 2x) for crisp sprites;
        // all game logic works in the 800x500 logical view
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.view = { width: 800, height: 500 };
        this.canvas.width = this.view.width * this.dpr;
        this.canvas.height = this.view.height * this.dpr;
        this.ctx = this.canvas.getContext('2d');

        // Load assets first, then start game
        Assets.load(() => {
            // Hide loading indicator
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.display = 'none';
            }

            // Restore progress
            const saved = localStorage.getItem('frogPrinceFable52_unlocked');
            if (saved) {
                this.unlockedLevel = parseInt(saved, 10) || 1;
            }
            try {
                const rec = JSON.parse(localStorage.getItem('frogPrinceFable52_records') || 'null');
                if (rec && Array.isArray(rec.stars) && Array.isArray(rec.best)) this.records = rec;
            } catch (e) {}

            // Browsers only allow sound after a user gesture
            for (const ev of ['keydown', 'mousedown', 'touchstart']) {
                window.addEventListener(ev, () => Audio.unlock(), { passive: true });
            }
            // Pause when the tab is hidden
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && this.state === 'PLAYING') this.paused = true;
            });

            // Keyboard
            this._setupKeyboard();

            // Mouse / click
            this.canvas.addEventListener('click', (e) => this._handleClick(e));
            this.canvas.addEventListener('mousemove', (e) => { this.mouse = this._toView(e); });
            this.canvas.addEventListener('mouseleave', () => { this.mouse = null; });

            // Touch
            this._setupTouch();

            this.showTitle();

            // Kick off the loop
            const loop = (timestamp) => {
                this.gameLoop(timestamp);
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
        });
    },

    // -------------------------------------------------------
    // Input setup
    // -------------------------------------------------------

    _setupKeyboard() {
        const keyMap = {
            'ArrowLeft': 'left',
            'a': 'left',
            'A': 'left',
            'ArrowRight': 'right',
            'd': 'right',
            'D': 'right',
            'ArrowUp': 'up',
            'w': 'up',
            'W': 'up',
            ' ': 'space'
        };

        window.addEventListener('keydown', (e) => {
            const mapped = keyMap[e.key];
            if (mapped) {
                e.preventDefault();
                this.keys[mapped] = true;
            }

            if (e.repeat) return;
            const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;

            if (k === 'm') {
                Audio.toggleMute();
            }
            // Pause / resume
            if (k === 'Escape' || k === 'p') {
                if (this.state === 'PLAYING') {
                    this.paused = !this.paused;
                    Audio.click();
                } else if (this.state === 'GAME_OVER' && k === 'Escape') {
                    this.showLevelSelect();
                }
                return;
            }
            if (this.state === 'PLAYING' && this.paused) {
                if (k === 'q') {
                    this.showLevelSelect();
                } else if (k === ' ' || k === 'Enter') {
                    this.paused = false;
                }
                return;
            }
            if (e.key === ' ' || e.key === 'Enter') {
                if (this.state === 'TITLE') {
                    Audio.click();
                    this.showLevelSelect();
                } else if (this.state === 'GAME_OVER') {
                    if (this.campaignMode) {
                        // Campaign over: restart from level 1 with full hearts
                        this.lives = this.maxLives;
                        this.startLevel(1, true);
                    } else {
                        this.startLevel(this.currentLevel);
                    }
                } else if (this.state === 'LEVEL_COMPLETE') {
                    if (this.currentLevel < 10) {
                        this.startLevel(this.currentLevel + 1, this.campaignMode);
                    } else {
                        this.showLevelSelect();
                    }
                } else if (this.state === 'FINAL_COMPLETE') {
                    Audio.click();
                    this.showTitle();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            const mapped = keyMap[e.key];
            if (mapped) {
                e.preventDefault();
                this.keys[mapped] = false;
            }
        });
    },

    // Which on-screen control (if any) a view-space point is on
    _touchZone(p) {
        if (p.y < 250) return null;
        if (p.x < 110) return 'left';
        if (p.x < 230) return 'right';
        if (p.x > 560) return 'jump';
        return null;
    },

    _hit(p, r) {
        return r && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
    },

    _setupTouch() {
        // Recompute held controls from every finger still down
        const sync = (e) => {
            this.touchLeft = this.touchRight = this.touchJump = false;
            if (this.state !== 'PLAYING' || this.paused) return;
            for (const t of e.touches) {
                const zone = this._touchZone(this._toView(t));
                if (zone === 'left') this.touchLeft = true;
                else if (zone === 'right') this.touchRight = true;
                else if (zone === 'jump') this.touchJump = true;
            }
        };

        this.canvas.addEventListener('touchstart', (e) => {
            this.touchUI = true;
            // In menus (and the pause menu), let the browser fire the
            // synthetic click so buttons stay tappable
            if (this.state !== 'PLAYING' || this.paused) { sync(e); return; }
            e.preventDefault();
            for (const t of e.changedTouches) {
                const p = this._toView(t);
                if (this._hit(p, Renderer.HUD_BTNS.pause)) this.paused = true;
                else if (this._hit(p, Renderer.HUD_BTNS.mute)) Audio.toggleMute();
            }
            sync(e);
        }, { passive: false });

        const onMoveEnd = (e) => {
            if (this.state === 'PLAYING' && !this.paused) e.preventDefault();
            sync(e);
        };
        this.canvas.addEventListener('touchmove', onMoveEnd, { passive: false });
        this.canvas.addEventListener('touchend', onMoveEnd, { passive: false });
        this.canvas.addEventListener('touchcancel', sync);
    },

    // -------------------------------------------------------
    // Click handler
    // -------------------------------------------------------

    // The canvas uses object-fit: contain, so the rendered content is
    // letterboxed inside the element — map pointer positions to the
    // content box, not the element box
    _toView(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scale = Math.min(rect.width / this.view.width, rect.height / this.view.height);
        const offX = rect.left + (rect.width - this.view.width * scale) / 2;
        const offY = rect.top + (rect.height - this.view.height * scale) / 2;
        return { x: (e.clientX - offX) / scale, y: (e.clientY - offY) / scale };
    },

    _handleClick(e) {
        const pos = this._toView(e);
        const mx = pos.x;
        const my = pos.y;

        switch (this.state) {
            case 'TITLE':
                Audio.click();
                this.showLevelSelect();
                break;

            case 'PLAYING':
                if (this.paused) {
                    const pb = this._pauseBtns || {};
                    if (this._hit(pos, pb.resume)) { Audio.click(); this.paused = false; }
                    else if (this._hit(pos, pb.select)) { Audio.click(); this.showLevelSelect(); }
                    else if (this._hit(pos, pb.sound)) { Audio.toggleMute(); Audio.click(); }
                } else if (this._hit(pos, Renderer.HUD_BTNS.pause)) {
                    Audio.click();
                    this.paused = true;
                } else if (this._hit(pos, Renderer.HUD_BTNS.mute)) {
                    Audio.toggleMute();
                    Audio.click();
                }
                break;

            case 'LEVEL_SELECT':
                // Check secret word clicks: "Select" → "a" → "Level"
                if (this._wordHitboxes) {
                    for (const wh of this._wordHitboxes) {
                        if (mx >= wh.x && mx <= wh.x + wh.w &&
                            my >= wh.y && my <= wh.y + wh.h) {
                            if (wh.index === this._secretStep) {
                                this._secretStep++;
                                if (this._secretStep >= 3) {
                                    this.unlockedLevel = 10;
                                    localStorage.setItem('frogPrinceFable52_unlocked', '10');
                                    this._secretStep = 0;
                                    Audio.levelComplete();
                                }
                            } else {
                                this._secretStep = 0;
                            }
                            break;
                        }
                    }
                }
                // Check "The End" button
                if (this._endBtn &&
                    mx >= this._endBtn.x && mx <= this._endBtn.x + this._endBtn.w &&
                    my >= this._endBtn.y && my <= this._endBtn.y + this._endBtn.h) {
                    Audio.click();
                    this.state = 'FINAL_COMPLETE';
                    this.finalStartTime = this.time;
                    this.fade = 1;
                    Audio.setScene(9);
                    break;
                }
                // Check mode toggle click
                if (this._modeToggle &&
                    mx >= this._modeToggle.x && mx <= this._modeToggle.x + this._modeToggle.w &&
                    my >= this._modeToggle.y && my <= this._modeToggle.y + this._modeToggle.h) {
                    Audio.click();
                    this.hardcoreMode = !this.hardcoreMode;
                    break;
                }
                for (const btn of this.levelButtons) {
                    if (
                        mx >= btn.x && mx <= btn.x + btn.w &&
                        my >= btn.y && my <= btn.y + btn.h &&
                        btn.level <= this.unlockedLevel
                    ) {
                        Audio.click();
                        // Starting from level select is always a fresh run
                        // (hardcore passes fromCampaign=true, which would
                        // otherwise carry over depleted lives)
                        this.lives = this.maxLives;
                        this.startLevel(btn.level, this.hardcoreMode);
                        break;
                    }
                }
                break;

            case 'GAME_OVER':
                Audio.click();
                if (this.campaignMode) {
                    this.lives = this.maxLives;
                    this.startLevel(1, true);
                } else {
                    this.startLevel(this.currentLevel);
                }
                break;

            case 'LEVEL_COMPLETE':
                Audio.click();
                this.showLevelSelect();
                break;

            case 'FINAL_COMPLETE':
                Audio.click();
                this.showTitle();
                break;

            default:
                break;
        }
    },

    // -------------------------------------------------------
    // State transitions
    // -------------------------------------------------------

    // The link to the classic version is only offered on the title screen
    _syncLink() {
        const link = document.getElementById('versionLink');
        if (link) link.style.display = this.state === 'TITLE' ? 'block' : 'none';
    },

    showTitle() {
        this.state = 'TITLE';
        this.paused = false;
        this.fade = 1;
        Audio.setScene(0);
        this._syncLink();
    },

    showLevelSelect() {
        this.state = 'LEVEL_SELECT';
        this.paused = false;
        this.fade = 1;
        Audio.setScene(0);
        this._syncLink();
    },

    // Lilypads for a level; levels 6+ get a checkpoint on the static pad
    // nearest the halfway point
    _buildPads(config) {
        const pads = (config.lilypads || []).map((padCfg) => createLilypad(padCfg));
        if (config.level >= 6) {
            const mid = (config.startX + config.prince.x) / 2;
            let best = -1;
            for (let i = 1; i < pads.length - 1; i++) {
                if (pads[i].type !== 'static') continue;
                if (best < 0 || Math.abs(pads[i].x - mid) < Math.abs(pads[best].x - mid)) best = i;
            }
            if (best >= 0) pads[best].checkpoint = true;
        }
        return pads;
    },

    // A golden fly hovers above every third pad
    _buildFlies(config) {
        const flies = [];
        const pads = config.lilypads || [];
        for (let i = 2; i < pads.length - 1; i += 3) {
            flies.push({
                x: pads[i].x + pads[i].width / 2,
                y: pads[i].y - 72 - (Math.floor(i / 3) % 3) * 16,
                phase: i,
                got: false
            });
        }
        return flies;
    },

    _saveRecords() {
        try {
            localStorage.setItem('frogPrinceFable52_records', JSON.stringify(this.records));
        } catch (e) {}
    },

    // Score the run: 1 star for finishing, 2 for half the flies, 3 for all
    _finishLevel() {
        const total = this.flies.length;
        const got = this.fliesGot;
        const stars = 1 + (got * 2 >= total ? 1 : 0) + (got === total ? 1 : 0);
        const i = this.currentLevel - 1;
        const prev = this.records.best[i];
        const newBest = !prev || this.levelTime < prev;
        if (newBest) this.records.best[i] = Math.round(this.levelTime);
        this.records.stars[i] = Math.max(this.records.stars[i] || 0, stars);
        this._saveRecords();
        this.lastResult = {
            stars: stars, got: got, total: total,
            time: this.levelTime, best: this.records.best[i], newBest: newBest
        };
    },

    startLevel(num, fromCampaign) {
        this.state = 'PLAYING';
        this.currentLevel = num;
        this.fade = 1;
        this.shake = 0;
        this.levelStartTime = this.time;
        Fx.ripples = [];
        this.paused = false;
        this.coyote = 0;
        this.jumpBuffer = 0;
        this.windGrace = 120;
        this.levelTime = 0;
        this.fliesGot = 0;
        this.checkpoint = null;
        this.checkpointTime = -99999;
        this.lastResult = null;
        this._syncLink();

        if (fromCampaign) {
            // Campaign: keep current lives (don't reset)
            this.campaignMode = true;
            this.campaignLevel = num;
        } else {
            // Replay from level select: fresh lives, no campaign penalty
            this.campaignMode = false;
            this.lives = this.maxLives;
        }

        const config = Levels.get(num);

        // Create entities from config
        this.frog = createFrog(config.startX, config.startY);
        this.prince = createPrince(config.prince.x, config.prince.y);

        this.lilypads = this._buildPads(config);
        this.flies = this._buildFlies(config);
        this.dragonflies = (config.dragonflies || []).map((df) => createDragonfly(df.x, df.y, df.patrolRange));
        Audio.setScene(config.scene || 0);

        // Spawn fish across the level
        this.fish = [];
        const lw = config.levelWidth || 800;
        const fishCount = Math.floor(lw / 150) + 5;
        for (let i = 0; i < fishCount; i++) {
            this.fish.push(createFish(
                Math.random() * lw,
                420 + Math.random() * 60
            ));
        }

        this.particles = [];
        this.cameraX = 0;
        this.levelWidth = lw;
        this.sceneId = config.scene || 0;

        // Wind
        this.windActive = false;
        this.windForce = 0;
        this.windTimer = 0;
        this.windConfig = config.wind || null;
    },

    // -------------------------------------------------------
    // Update
    // -------------------------------------------------------

    // One fixed 60 Hz simulation step
    step() {
        if (this.shake > 0) this.shake--;
        if (this.state === 'PLAYING') {
            this.updatePlaying();
        } else if (this.state === 'KISS_CUTSCENE') {
            this.updateKissCutscene();
        }
    },

    updatePlaying() {
        const frog = this.frog;
        if (!frog) return;

        // --- Input ---
        const wantsLeft = this.keys.left || this.touchLeft;
        const wantsRight = this.keys.right || this.touchRight;
        const wantsJump = this.keys.up || this.keys.space || this.touchJump;

        if (wantsLeft) frog.moveLeft();
        if (wantsRight) frog.moveRight();

        // Forgiving jumps: a press is remembered for a few frames before
        // landing (buffer), and still works just after leaving a pad (coyote)
        if (wantsJump && !this._jumpWas) this.jumpBuffer = 7;
        this._jumpWas = wantsJump;
        if (frog.onGround) this.coyote = 6;
        const canJump = !frog.jumping &&
            ((frog.onGround && wantsJump) || (this.jumpBuffer > 0 && this.coyote > 0));
        if (canJump) {
            frog.jump(true);
            this.coyote = 0;
            this.jumpBuffer = 0;
            Audio.jump();
            Fx.addRipple(frog.x + frog.width / 2, frog.y + frog.height + 4, 22);
        } else if (wantsJump && frog.jumping) {
            frog.holdJump();
        }
        if (this.coyote > 0) this.coyote--;
        if (this.jumpBuffer > 0) this.jumpBuffer--;
        this.levelTime += 1000 / 60;

        // --- Physics ---
        const wasOnGround = frog.onGround;
        Physics.applyGravity(frog);

        // Update lilypads, dragonflies, and fish
        for (const pad of this.lilypads) {
            pad.update(this.stepTime);
        }
        for (const df of this.dragonflies) {
            df.update();
        }
        for (const f of this.fish) {
            f.update(this.stepTime, this.levelWidth);
        }

        // Platform collision
        const result = Physics.checkPlatformCollision(frog, this.lilypads);
        if (result && result.onPlatform) {
            frog.onGround = true;
            frog.jumping = false;
            if (!wasOnGround) {
                Audio.land();
                frog.landTime = this.time; // landing squash animation
                Fx.addRipple(frog.x + frog.width / 2, frog.y + frog.height + 4, 34);
            }
            if (result.platform) {
                // Carry the frog along with moving pads
                frog.x += (result.platform.offsetX || 0) - (result.platform.prevOffsetX || 0);
                if (result.platform.type === 'sinking') {
                    result.platform.startSinking();
                }
                if (result.platform.type === 'disappearing') {
                    result.platform.startDisappearing();
                }
                // Light the checkpoint lantern
                if (result.platform.checkpoint && !this.checkpoint) {
                    const cp = result.platform;
                    this.checkpoint = { x: cp.x + cp.width / 2 - frog.width / 2, y: cp.y - 30 };
                    this.checkpointTime = this.time;
                    Audio.checkpoint();
                    for (let i = 0; i < 10; i++) {
                        this.particles.push(createParticle(cp.x + cp.width - 16, cp.y - 30, 'sparkle'));
                    }
                }
            }
        } else {
            frog.onGround = false;
        }

        // --- Wind ---
        if (this.windGrace > 0) {
            // Calm spell after a (re)spawn so the first pad is safe
            this.windGrace--;
            this.windActive = false;
            this.windForce = 0;
        } else if (this.windConfig && this.windConfig.force > 0) {
            this.windTimer++;
            const interval = this.windConfig.interval || 300;
            const duration = this.windConfig.duration || 120;
            const cycle = this.windTimer % interval;

            if (cycle < duration) {
                this.windActive = true;
                this.windForce = this.windConfig.force;
                frog.vx += this.windConfig.force * 0.1;
                // Streak particles so gusts are visible in the world
                if (Math.random() < 0.25) {
                    this.particles.push(createParticle(
                        this.cameraX + Math.random() * 800,
                        60 + Math.random() * 300,
                        'wind'
                    ));
                }
            } else {
                this.windActive = false;
                this.windForce = 0;
            }
        } else {
            this.windActive = false;
        }

        // --- Water collision ---
        if (Physics.checkWaterCollision(frog, Levels.WATER_LEVEL)) {
            this.death();
            return;
        }

        // --- Dragonfly collision ---
        for (const df of this.dragonflies) {
            if (Physics.checkEntityCollision(frog, df)) {
                this.death();
                return;
            }
        }

        // --- Golden flies ---
        const fcx = frog.x + frog.width / 2, fcy = frog.y + frog.height / 2;
        for (const fly of this.flies) {
            if (fly.got) continue;
            const dx = fcx - fly.x, dy = fcy - fly.y;
            if (dx * dx + dy * dy < 28 * 28) {
                fly.got = true;
                this.fliesGot++;
                Audio.collect();
                for (let i = 0; i < 7; i++) {
                    this.particles.push(createParticle(fly.x, fly.y, 'sparkle'));
                }
            }
        }

        // --- Prince collision ---
        if (this.prince && Physics.checkEntityCollision(frog, this.prince)) {
            this.startKissCutscene();
            return;
        }

        // --- Camera: eased follow with a little look-ahead ---
        const camTarget = this._camTarget(frog.x + frog.facing * 40);
        this.cameraX += (camTarget - this.cameraX) * 0.12;

        // --- Sparkle trail while airborne ---
        if (!frog.onGround && Math.random() < 0.3) {
            this.particles.push(createParticle(
                frog.x + frog.width / 2 + (Math.random() - 0.5) * 16,
                frog.y + frog.height - 4,
                'sparkle'
            ));
        }
        Fx.updateRipples();

        // --- Particles ---
        for (const p of this.particles) {
            p.update();
        }
        this.particles = this.particles.filter((p) => p.active);

        // --- Out-of-bounds check ---
        if (frog.y > this.view.height + 50 || frog.x < this.cameraX - 50) {
            this.death();
            return;
        }
    },

    // -------------------------------------------------------
    // Death
    // -------------------------------------------------------

    _camTarget(x) {
        return Math.max(0, Math.min(x - 300, this.levelWidth - 800));
    },

    death() {
        Audio.death();
        Audio.splash();
        this.shake = 14;
        this.hitTime = this.time;
        if (this.frog) {
            Fx.addRipple(this.frog.x + 15, Levels.WATER_LEVEL - 6, 60);
        }

        // Spawn splash particles
        if (this.frog) {
            for (let i = 0; i < 16; i++) {
                this.particles.push(
                    createParticle(this.frog.x + 15, this.frog.y + 20, 'splash')
                );
            }
        }

        this.lives--;
        if (this.lives <= 0) {
            this.state = 'GAME_OVER';
            Audio.death();
        } else {
            // Respawn at the checkpoint if its lantern is lit
            const config = Levels.get(this.currentLevel);
            this.frog = this.checkpoint
                ? createFrog(this.checkpoint.x, this.checkpoint.y)
                : createFrog(config.startX, config.startY);
            this.coyote = 0;
            this.jumpBuffer = 0;

            // Reset lilypads
            this.lilypads = this._buildPads(config);

            // Reset wind, with a calm spell
            this.windTimer = 0;
            this.windActive = false;
            this.windGrace = 120;

            // The eased camera must snap back with the frog, or the
            // out-of-bounds check would fire while it glides home
            this.cameraX = this._camTarget(this.frog.x);
        }
    },

    // -------------------------------------------------------
    // Kiss cutscene
    // -------------------------------------------------------

    startKissCutscene() {
        this.state = 'KISS_CUTSCENE';
        this.kissProgress = 0;
        this._finishLevel();
        // Snap the camera to the frog (the collision check runs before the
        // camera update, so it can be a frame behind)
        if (this.frog) {
            this.cameraX = this._camTarget(this.frog.x);
        }
        if (this.prince && this.prince.startTransform) {
            this.prince.startTransform();
        }
        Audio.kiss();
    },

    updateKissCutscene() {
        this.kissProgress += 0.005;

        if (this.prince && this.prince.updateTransform) {
            this.prince.updateTransform();
        }

        // Spawn heart particles occasionally
        if (Math.random() < 0.08 && this.frog && this.prince) {
            const mx = (this.frog.x + this.prince.x) / 2;
            const my = (this.frog.y + this.prince.y) / 2;
            this.particles.push(createParticle(mx, my, 'heart'));
        }

        // Update existing particles
        for (const p of this.particles) {
            p.update();
        }
        this.particles = this.particles.filter((p) => p.active);
        Fx.updateRipples();

        if (this.kissProgress >= 1.0) {
            Audio.levelComplete();
            this.fade = 0.6;
            if (this.currentLevel >= 10) {
                Audio.setScene(9);
                this.state = 'FINAL_COMPLETE';
                this.finalStartTime = this.time;
            } else {
                this.state = 'LEVEL_COMPLETE';
                // Unlock next level
                const nextLevel = this.currentLevel + 1;
                if (nextLevel > this.unlockedLevel) {
                    this.unlockedLevel = nextLevel;
                    localStorage.setItem('frogPrinceFable52_unlocked', String(this.unlockedLevel));
                }
                Audio.unlockLevel();
            }
        }
    },

    // -------------------------------------------------------
    // Render
    // -------------------------------------------------------

    render() {
        const ctx = this.ctx;
        // All drawing happens in the 800x500 logical view, scaled up to
        // the device-resolution backing store
        const canvas = this.view;

        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        switch (this.state) {
            case 'TITLE':
                Renderer.drawTitleScreen(ctx, canvas, this.time);
                break;

            case 'LEVEL_SELECT':
                var lsResult = Renderer.drawLevelSelect(
                    ctx, canvas, this.unlockedLevel, Levels.CLOTHING_NAMES, this.hardcoreMode,
                    this.time, this.mouse, this.records
                );
                this.levelButtons = lsResult.buttons;
                this._modeToggle = lsResult.toggle;
                this._wordHitboxes = lsResult.words;
                this._endBtn = lsResult.endBtn;
                break;

            case 'PLAYING':
                this._renderPlayingScene(ctx, canvas);
                Renderer.drawHUD(ctx, this.currentLevel, this.lives, canvas, {
                    time: this.time,
                    sceneName: Fx.SCENE_NAMES[this.sceneId],
                    maxLives: this.maxLives,
                    hitTime: this.hitTime,
                    startTime: this.levelStartTime,
                    progress: this._progress(this.frog ? this.frog.x : 105),
                    timer: this.levelTime,
                    flies: { got: this.fliesGot, total: this.flies.length },
                    checkpointFrac: this._checkpointFrac(),
                    checkpointOn: !!this.checkpoint,
                    checkpointTime: this.checkpointTime,
                    muted: Audio.isMuted(),
                    paused: this.paused,
                    touchUI: this.touchUI,
                    touch: { left: this.touchLeft, right: this.touchRight, jump: this.touchJump }
                });
                if (this.windActive) {
                    Renderer.drawWindIndicator(ctx, canvas, this.windForce, this.time);
                }
                if (this.paused) {
                    this._pauseBtns = Renderer.drawPause(ctx, canvas, this.realTime, Audio.isMuted(), this.mouse);
                }
                break;

            case 'GAME_OVER':
                this._renderPlayingScene(ctx, canvas);
                Renderer.drawGameOver(ctx, canvas, this.campaignMode, this.time);
                break;

            case 'LEVEL_COMPLETE':
                // Completing level N earns the outfit worn in level N+1
                this._renderPlayingScene(ctx, canvas, true);
                Renderer.drawLevelComplete(
                    ctx, canvas, this.currentLevel,
                    Levels.CLOTHING_NAMES[this.currentLevel] || Levels.CLOTHING_NAMES[9],
                    this.time, this.lastResult
                );
                break;

            case 'KISS_CUTSCENE':
                // Cutscene draws its own frog/prince, so skip them in the
                // base scene to avoid frozen duplicates underneath
                this._renderPlayingScene(ctx, canvas, true);
                Renderer.drawKissCutscene(
                    ctx, canvas, this.frog, this.prince,
                    this.kissProgress, this.time, this.currentLevel,
                    this.cameraX
                );
                Fx.post(ctx, canvas, this.sceneId);
                break;

            case 'FINAL_COMPLETE':
                this._renderFinalComplete(ctx, canvas);
                break;
        }

        // Fade in from black after a screen change
        if (this.fade > 0) {
            ctx.fillStyle = 'rgba(2,4,14,' + Math.min(1, this.fade) + ')';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    },

    _progress(x) {
        if (!this.prince) return 0;
        return (x - 105) / Math.max(1, this.prince.x - 105 - 30);
    },

    _checkpointFrac() {
        for (const pad of this.lilypads) {
            if (pad.checkpoint) return this._progress(pad.x + pad.width / 2 - 15);
        }
        return null;
    },

    _renderPlayingScene(ctx, canvas, skipActors) {
        const sceneId = this.sceneId;
        const shift = Fx.bgShift(this.cameraX, this.levelWidth, canvas.width);

        // Screen shake (e.g. on a splash)
        ctx.save();
        if (this.shake > 0 && !this.paused) {
            const mag = this.shake * 0.5;
            ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
        }

        // Background art, water, sky effects
        Renderer.drawWater(ctx, canvas, this.time, this.cameraX, sceneId, this.levelWidth);
        Fx.ambientBack(ctx, canvas, this.time, sceneId, shift);

        ctx.save();
        ctx.translate(-this.cameraX, 0);

        // Fish (below everything on the surface)
        for (const f of this.fish) {
            Renderer.drawFish(ctx, f, this.time);
        }

        // Reflections in the water (pads are drawn over them afterwards)
        const waterLine = 410;
        for (const df of this.dragonflies) {
            Fx.reflect(ctx, waterLine, 0.1, () => Renderer.drawDragonfly(ctx, df));
        }
        if (!skipActors) {
            if (this.prince) {
                Fx.reflect(ctx, waterLine, 0.16, () => Renderer.drawPrince(ctx, this.prince, this.time));
            }
            if (this.frog) {
                Fx.reflect(ctx, waterLine, 0.18,
                    () => Renderer.drawFrog(ctx, this.frog, this.currentLevel, this.time));
            }
        }

        Fx.drawRipples(ctx);

        // Lilypads
        for (const pad of this.lilypads) {
            Renderer.drawLilypad(ctx, pad, this.time);
        }

        // Checkpoint lantern
        for (const pad of this.lilypads) {
            if (pad.checkpoint) Fx.lantern(ctx, pad, this.time, !!this.checkpoint);
        }

        // Golden flies
        for (const fly of this.flies) {
            Fx.fly(ctx, fly, this.time);
        }

        // Dragonflies
        for (const df of this.dragonflies) {
            Renderer.drawDragonfly(ctx, df);
        }

        // Prince, marked by a golden beacon
        if (this.prince && !skipActors) {
            Fx.beacon(ctx, this.prince, this.time);
            Renderer.drawPrince(ctx, this.prince, this.time);
        }

        // Frog
        if (this.frog && !skipActors) {
            Fx.shadow(ctx, this.frog);
            Renderer.drawFrog(ctx, this.frog, this.currentLevel, this.time);
            Renderer.drawFrogClothing(ctx, this.frog, this.currentLevel, this.time);
        }

        // Particles
        for (const p of this.particles) {
            Renderer.drawParticle(ctx, p);
        }

        ctx.restore();

        // Foreground depth layer, weather, then grade + vignette
        Renderer.drawForeground(ctx, canvas, this.time, this.cameraX);
        Fx.ambientFront(ctx, canvas, this.time, sceneId, this.cameraX);
        ctx.restore(); // shake

        // The cutscene draws its actors next, so it applies the grade itself
        if (this.state !== 'KISS_CUTSCENE') {
            Fx.post(ctx, canvas, sceneId);
        }
    },

    _renderFinalComplete(ctx, canvas) {
        const W = canvas.width;
        const H = canvas.height;
        const elapsed = this.time - (this.finalStartTime || 0);

        // Celebratory cosmic backdrop
        Renderer._backdrop(ctx, canvas, 'bg-cosmic-night', this.time, 0.35);
        Fx.ambientBack(ctx, canvas, this.time, 9, 0);

        // Sparkle effects
        const sparkleCount = 30;
        for (let i = 0; i < sparkleCount; i++) {
            const phase = this.time * 0.001 + i * 1.37;
            const sx = (Math.sin(phase * 0.7 + i) * 0.5 + 0.5) * W;
            const sy = (Math.cos(phase * 0.5 + i * 0.8) * 0.5 + 0.5) * H;
            const size = Math.sin(phase * 2) * 2 + 3;
            const alpha = Math.sin(phase * 1.5) * 0.4 + 0.6;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Center positions for frog and prince
        const centerY = H * 0.55;
        const frogCenterX = W / 2 - 60;
        const princeCenterX = W / 2 + 60;

        // Transform progress: starts after 1.5s, completes over 4s
        const transformDelay = 1500;
        const transformDuration = 4000;
        const tp = Math.max(0, Math.min(1, (elapsed - transformDelay) / transformDuration));

        // Draw frog (with level 10 clothing) centered
        const frogObj = {
            x: frogCenterX,
            y: centerY - 14,
            width: 30,
            height: 28,
            facing: 1,
            vy: 0
        };
        Renderer.drawFrog(ctx, frogObj, 10);

        // Draw prince transforming into frog
        const princeObj = {
            x: princeCenterX,
            y: centerY - 22,
            width: 30,
            height: 45,
            transformProgress: tp,
            facing: -1
        };
        Renderer.drawPrince(ctx, princeObj, this.time);

        // Heart particles between them during transform
        if (tp > 0 && tp < 1) {
            const midX = (frogCenterX + princeCenterX) / 2;
            for (let i = 0; i < 5; i++) {
                const hx = midX + Math.sin(i * 1.8 + this.time * 0.004) * 15;
                const hy = centerY - 40 - i * 12 - Math.sin(this.time * 0.003 + i) * 5;
                const ha = Math.sin(this.time * 0.005 + i * 1.2) * 0.3 + 0.7;
                Renderer.drawParticle(ctx, { type: 'heart', x: hx, y: hy, size: 6, life: ha });
            }
        }

        // Title — fades in after transform completes
        const titleAlpha = tp >= 1 ? Math.min(1, (elapsed - transformDelay - transformDuration) / 1000) : 0;
        if (titleAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = titleAlpha;
            Fx.goldText(ctx, 'The End', W / 2, H * 0.22, 60, 'center', 3);
            ctx.font = 'italic 17px ' + Fx.FONT_BODY;
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.fillText('…and they lived hoppily ever after.', W / 2, H * 0.22 + 34);
            ctx.restore();
        }

        Fx.ambientFront(ctx, canvas, this.time, 9, 0);
        Fx.post(ctx, canvas, 9);

        // Hint to continue
        const blink = Math.sin(this.time * 0.004) * 0.4 + 0.6;
        ctx.globalAlpha = blink;
        ctx.fillStyle = '#dddddd';
        ctx.font = '16px ' + Fx.FONT_BODY;
        ctx.textAlign = 'center';
        ctx.fillText('Click to return to title', W / 2, H * 0.92);
        ctx.globalAlpha = 1.0;
    },

    // -------------------------------------------------------
    // Game loop
    // -------------------------------------------------------

    gameLoop(timestamp) {
        const dt = Math.min(100, timestamp - (this._lastTs || timestamp));
        this._lastTs = timestamp;
        this.realTime = timestamp;

        // Fixed-timestep simulation: identical speed on 60 Hz, 120 Hz
        // or struggling devices. The game clock stops while paused.
        if (!this.paused) {
            const STEP = 1000 / 60;
            this.time += dt;
            this._acc += dt;
            while (this._acc >= STEP) {
                this._acc -= STEP;
                this.stepTime = this.time - this._acc;
                this.step();
            }
        }
        if (this.fade > 0) this.fade -= dt / 400;

        this.render();
    }
};

// -------------------------------------------------------
// Bootstrap
// -------------------------------------------------------
window.addEventListener('load', () => {
    Game.init();
});
