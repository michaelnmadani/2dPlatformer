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
    lives: 3,
    maxLives: 3,
    frog: null,
    prince: null,
    lilypads: [],
    dragonflies: [],
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
        this.canvas.width = 800;
        this.canvas.height = 500;
        this.ctx = this.canvas.getContext('2d');

        // Hide loading indicator if present
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
    },

    // -------------------------------------------------------
    // Input setup
    // -------------------------------------------------------

    _setupKeyboard() {
        const keyMap = {
            'ArrowLeft': 'left',
            'a': 'left',
            'ArrowRight': 'right',
            'd': 'right',
            'ArrowUp': 'up',
            'w': 'up',
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
            if (e.key === ' ' || e.key === 'Enter') {
                if (this.state === 'GAME_OVER') {
                    this.startLevel(this.currentLevel);
                } else if (this.state === 'LEVEL_COMPLETE') {
                    if (this.currentLevel < 10) {
                        this.startLevel(this.currentLevel + 1);
                    } else {
                        this.showLevelSelect();
                    }
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
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        switch (this.state) {
            case 'TITLE':
                Audio.click();
                this.showLevelSelect();
                break;

            case 'LEVEL_SELECT':
                for (const btn of this.levelButtons) {
                    if (
                        mx >= btn.x && mx <= btn.x + btn.w &&
                        my >= btn.y && my <= btn.y + btn.h &&
                        btn.level <= this.unlockedLevel
                    ) {
                        Audio.click();
                        this.startLevel(btn.level);
                        break;
                    }
                }
                break;

            case 'GAME_OVER':
                Audio.click();
                this.startLevel(this.currentLevel);
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

    startLevel(num) {
        this.state = 'PLAYING';
        this.currentLevel = num;
        this.lives = this.maxLives;

        const config = Levels.get(num);

        // Create entities from config
        this.frog = createFrog(config.startX, config.startY);
        this.prince = createPrince(config.prince.x, config.prince.y);

        this.lilypads = (config.lilypads || []).map((padCfg) => createLilypad(padCfg));
        this.dragonflies = (config.dragonflies || []).map((df) => createDragonfly(df.x, df.y, df.patrolRange));

        this.particles = [];
        this.cameraX = 0;
        this.levelWidth = config.levelWidth || 800;

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

        // Update lilypads and dragonflies
        for (const pad of this.lilypads) {
            pad.update(this.time);
        }
        for (const df of this.dragonflies) {
            df.update();
        }

        // Platform collision
        const result = Physics.checkPlatformCollision(frog, this.lilypads);
        if (result && result.onPlatform) {
            frog.onGround = true;
            frog.jumping = false;
            if (!wasOnGround) {
                Audio.land();
            }
            if (result.platform) {
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
        if (frog.y > this.canvas.height + 50 || frog.x < this.cameraX - 50) {
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
            for (let i = 0; i < 8; i++) {
                this.particles.push(
                    createParticle(this.frog.x, this.frog.y, 'splash')
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
        const canvas = this.canvas;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        switch (this.state) {
            case 'TITLE':
                Renderer.drawTitleScreen(ctx, canvas, this.time);
                break;

            case 'LEVEL_SELECT':
                this.levelButtons = Renderer.drawLevelSelect(
                    ctx, canvas, this.unlockedLevel, Levels.CLOTHING_NAMES
                );
                break;

            case 'PLAYING':
                this._renderPlayingScene(ctx, canvas);
                Renderer.drawHUD(ctx, canvas, this.lives, this.maxLives, this.currentLevel);
                if (this.windActive) {
                    Renderer.drawWindIndicator(ctx, canvas, this.windForce);
                }
                break;

            case 'GAME_OVER':
                this._renderPlayingScene(ctx, canvas);
                Renderer.drawGameOver(ctx, canvas);
                break;

            case 'LEVEL_COMPLETE':
                Renderer.drawLevelComplete(
                    ctx, canvas, this.currentLevel,
                    Levels.CLOTHING_NAMES[this.currentLevel - 1],
                    this.time
                );
                break;

            case 'KISS_CUTSCENE':
                this._renderPlayingScene(ctx, canvas);
                Renderer.drawKissCutscene(
                    ctx, canvas, this.frog, this.prince,
                    this.kissProgress, this.time
                );
                break;

            case 'FINAL_COMPLETE':
                this._renderFinalComplete(ctx, canvas);
                break;
        }
    },

    _renderPlayingScene(ctx, canvas) {
        // Water background
        Renderer.drawWater(ctx, canvas, this.time);

        ctx.save();
        ctx.translate(-this.cameraX, 0);

        // Lilypads
        for (const pad of this.lilypads) {
            Renderer.drawLilypad(ctx, pad);
        }

        // Dragonflies
        for (const df of this.dragonflies) {
            Renderer.drawDragonfly(ctx, df);
        }

        // Prince
        if (this.prince) {
            Renderer.drawPrince(ctx, this.prince);
        }

        // Frog
        if (this.frog) {
            Renderer.drawFrog(ctx, this.frog);
            Renderer.drawFrogClothing(ctx, this.frog, this.currentLevel);
        }

        // Particles
        for (const p of this.particles) {
            Renderer.drawParticle(ctx, p);
        }

        ctx.restore();
    },

    _renderFinalComplete(ctx, canvas) {
        // Dark celebratory background
        ctx.fillStyle = '#0a0025';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Sparkle effects
        const sparkleCount = 30;
        for (let i = 0; i < sparkleCount; i++) {
            const phase = this.time * 0.001 + i * 1.37;
            const sx = (Math.sin(phase * 0.7 + i) * 0.5 + 0.5) * canvas.width;
            const sy = (Math.cos(phase * 0.5 + i * 0.8) * 0.5 + 0.5) * canvas.height;
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

        // Title
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 64px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('The End!', canvas.width / 2, 140);

        // Messages
        ctx.fillStyle = '#ffffff';
        ctx.font = '28px serif';
        ctx.fillText('All princes have been transformed!', canvas.width / 2, 240);

        ctx.fillStyle = '#88ff88';
        ctx.font = 'bold 32px serif';
        ctx.fillText('The Frog King reigns supreme!', canvas.width / 2, 310);

        // Hint to continue
        const blink = Math.sin(this.time * 0.004) * 0.4 + 0.6;
        ctx.globalAlpha = blink;
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '18px sans-serif';
        ctx.fillText('Click to return to title', canvas.width / 2, 420);
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
