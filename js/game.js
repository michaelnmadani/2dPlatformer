/**
 * game.js - Main game loop, state machine, and input handling
 * for a 2D frog platformer ("The Frog Prince").
 *
 * Depends on globals: Renderer, Physics, Levels, Audio,
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
            const saved = localStorage.getItem('frogPrince_unlocked');
            if (saved) {
                this.unlockedLevel = parseInt(saved, 10) || 1;
            }

            // Keyboard
            this._setupKeyboard();

            // Mouse / click
            this.canvas.addEventListener('click', (e) => this._handleClick(e));

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

            // State transitions on key press
            if (e.key === 'Escape') {
                if (this.state === 'PLAYING' || this.state === 'GAME_OVER') {
                    this.showLevelSelect();
                }
            }
            // Ignore auto-repeat so a held jump key can't skip
            // GAME_OVER / LEVEL_COMPLETE screens instantly
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
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

    _setupTouch() {
        this.canvas.addEventListener('touchstart', (e) => {
            // Outside gameplay, let the browser fire the synthetic click
            // so menus stay tappable on touch devices
            if (this.state !== 'PLAYING') return;
            e.preventDefault();
            for (const touch of e.changedTouches) {
                const rect = this.canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const third = rect.width / 3;

                if (x < third) {
                    this.touchLeft = true;
                } else if (x > third * 2) {
                    this.touchRight = true;
                }
                // Any tap also triggers jump
                this.touchJump = true;
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            if (this.state !== 'PLAYING') {
                this.touchLeft = false;
                this.touchRight = false;
                this.touchJump = false;
                return;
            }
            e.preventDefault();
            for (const touch of e.changedTouches) {
                const rect = this.canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const third = rect.width / 3;

                if (x < third) {
                    this.touchLeft = false;
                } else if (x > third * 2) {
                    this.touchRight = false;
                }
                this.touchJump = false;
            }
        }, { passive: false });

        this.canvas.addEventListener('touchcancel', (e) => {
            this.touchLeft = false;
            this.touchRight = false;
            this.touchJump = false;
        });
    },

    // -------------------------------------------------------
    // Click handler
    // -------------------------------------------------------

    _handleClick(e) {
        // The canvas uses object-fit: contain, so the rendered content is
        // letterboxed inside the element — map clicks to the content box,
        // not the element box
        const rect = this.canvas.getBoundingClientRect();
        const scale = Math.min(rect.width / this.view.width, rect.height / this.view.height);
        const offX = rect.left + (rect.width - this.view.width * scale) / 2;
        const offY = rect.top + (rect.height - this.view.height * scale) / 2;
        const mx = (e.clientX - offX) / scale;
        const my = (e.clientY - offY) / scale;

        switch (this.state) {
            case 'TITLE':
                Audio.click();
                this.showLevelSelect();
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
                                    localStorage.setItem('frogPrince_unlocked', '10');
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

    showTitle() {
        this.state = 'TITLE';
    },

    showLevelSelect() {
        this.state = 'LEVEL_SELECT';
    },

    startLevel(num, fromCampaign) {
        this.state = 'PLAYING';
        this.currentLevel = num;

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

        this.lilypads = (config.lilypads || []).map((padCfg) => createLilypad(padCfg));
        this.dragonflies = (config.dragonflies || []).map((df) => createDragonfly(df.x, df.y, df.patrolRange));

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

    update(timestamp) {
        this.time = timestamp;

        switch (this.state) {
            case 'TITLE':
                // Idle animation handled by renderer
                break;
            case 'LEVEL_SELECT':
                break;
            case 'PLAYING':
                this.updatePlaying();
                break;
            case 'GAME_OVER':
                break;
            case 'LEVEL_COMPLETE':
                break;
            case 'KISS_CUTSCENE':
                this.updateKissCutscene();
                break;
            case 'FINAL_COMPLETE':
                break;
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

        if (wantsJump) {
            if (frog.onGround && !frog.jumping) {
                frog.jump();
                Audio.jump();
            } else if (frog.jumping) {
                frog.holdJump();
            }
        }

        // --- Physics ---
        const wasOnGround = frog.onGround;
        Physics.applyGravity(frog);

        // Update lilypads, dragonflies, and fish
        for (const pad of this.lilypads) {
            pad.update(this.time);
        }
        for (const df of this.dragonflies) {
            df.update();
        }
        for (const f of this.fish) {
            f.update(this.time, this.levelWidth);
        }

        // Platform collision
        const result = Physics.checkPlatformCollision(frog, this.lilypads);
        if (result && result.onPlatform) {
            frog.onGround = true;
            frog.jumping = false;
            if (!wasOnGround) {
                Audio.land();
                frog.landTime = this.time; // landing squash animation
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
            }
        } else {
            frog.onGround = false;
        }

        // --- Wind ---
        if (this.windConfig && this.windConfig.force > 0) {
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

        // --- Prince collision ---
        if (this.prince && Physics.checkEntityCollision(frog, this.prince)) {
            this.startKissCutscene();
            return;
        }

        // --- Camera ---
        this.cameraX = frog.x - 300;
        if (this.cameraX < 0) this.cameraX = 0;
        if (this.cameraX > this.levelWidth - 800) this.cameraX = this.levelWidth - 800;

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

    death() {
        Audio.death();
        Audio.splash();

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
            // Reset frog position
            const config = Levels.get(this.currentLevel);
            this.frog = createFrog(config.startX, config.startY);

            // Reset lilypads
            this.lilypads = (config.lilypads || []).map((padCfg) => createLilypad(padCfg));

            // Reset wind
            this.windTimer = 0;
            this.windActive = false;
        }
    },

    // -------------------------------------------------------
    // Kiss cutscene
    // -------------------------------------------------------

    startKissCutscene() {
        this.state = 'KISS_CUTSCENE';
        this.kissProgress = 0;
        // Snap the camera to the frog (the collision check runs before the
        // camera update, so it can be a frame behind)
        if (this.frog) {
            this.cameraX = Math.max(0, Math.min(this.frog.x - 300, this.levelWidth - 800));
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

        if (this.kissProgress >= 1.0) {
            Audio.levelComplete();
            if (this.currentLevel >= 10) {
                this.state = 'FINAL_COMPLETE';
                this.finalStartTime = this.time;
            } else {
                this.state = 'LEVEL_COMPLETE';
                // Unlock next level
                const nextLevel = this.currentLevel + 1;
                if (nextLevel > this.unlockedLevel) {
                    this.unlockedLevel = nextLevel;
                    localStorage.setItem('frogPrince_unlocked', String(this.unlockedLevel));
                }
                Audio.unlock();
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
                    ctx, canvas, this.unlockedLevel, Levels.CLOTHING_NAMES, this.hardcoreMode
                );
                this.levelButtons = lsResult.buttons;
                this._modeToggle = lsResult.toggle;
                this._wordHitboxes = lsResult.words;
                this._endBtn = lsResult.endBtn;
                break;

            case 'PLAYING':
                this._renderPlayingScene(ctx, canvas);
                Renderer.drawHUD(ctx, this.currentLevel, this.lives, canvas);
                if (this.windActive) {
                    Renderer.drawWindIndicator(ctx, canvas, this.windForce);
                }
                break;

            case 'GAME_OVER':
                this._renderPlayingScene(ctx, canvas);
                Renderer.drawGameOver(ctx, canvas, this.campaignMode);
                break;

            case 'LEVEL_COMPLETE':
                // Completing level N earns the outfit worn in level N+1
                Renderer.drawLevelComplete(
                    ctx, canvas, this.currentLevel,
                    Levels.CLOTHING_NAMES[this.currentLevel] || Levels.CLOTHING_NAMES[9],
                    this.time
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
                break;

            case 'FINAL_COMPLETE':
                this._renderFinalComplete(ctx, canvas);
                break;
        }
    },

    _renderPlayingScene(ctx, canvas, skipActors) {
        // Water background
        Renderer.drawWater(ctx, canvas, this.time, this.cameraX, this.sceneId);

        ctx.save();
        ctx.translate(-this.cameraX, 0);

        // Fish (below lilypads)
        for (const f of this.fish) {
            Renderer.drawFish(ctx, f, this.time);
        }

        // Lilypads
        for (const pad of this.lilypads) {
            Renderer.drawLilypad(ctx, pad, this.time);
        }

        // Dragonflies
        for (const df of this.dragonflies) {
            Renderer.drawDragonfly(ctx, df);
        }

        // Prince
        if (this.prince && !skipActors) {
            Renderer.drawPrince(ctx, this.prince, this.time);
        }

        // Frog
        if (this.frog && !skipActors) {
            Renderer.drawFrog(ctx, this.frog, this.currentLevel, this.time);
            Renderer.drawFrogClothing(ctx, this.frog, this.currentLevel, this.time);
        }

        // Particles
        for (const p of this.particles) {
            Renderer.drawParticle(ctx, p);
        }

        ctx.restore();
    },

    _renderFinalComplete(ctx, canvas) {
        const W = canvas.width;
        const H = canvas.height;
        const elapsed = this.time - (this.finalStartTime || 0);

        // Dark celebratory background
        ctx.fillStyle = '#0a0025';
        ctx.fillRect(0, 0, W, H);

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
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 64px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('The End!', W / 2, H * 0.18);
            ctx.restore();
        }

        // Hint to continue
        const blink = Math.sin(this.time * 0.004) * 0.4 + 0.6;
        ctx.globalAlpha = blink;
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Click to return to title', W / 2, H * 0.9);
        ctx.globalAlpha = 1.0;
    },

    // -------------------------------------------------------
    // Game loop
    // -------------------------------------------------------

    gameLoop(timestamp) {
        this.update(timestamp);
        this.render();
    }
};

// -------------------------------------------------------
// Bootstrap
// -------------------------------------------------------
window.addEventListener('load', () => {
    Game.init();
});
