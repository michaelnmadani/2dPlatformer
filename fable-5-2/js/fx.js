/**
 * fx.js - Visual effects layer for The Frog Prince FABLE 5.2
 *
 * Ambient per-scene weather/life, water glints, ripples, reflections,
 * glow helpers, and post-processing (color grade + vignette).
 * Everything is deterministic from `time` (no per-frame allocation)
 * except ripples, which are short-lived world-space objects.
 */
const Fx = {
  FONT_HEAD: '"Cinzel", Georgia, serif',
  FONT_BODY: 'Georgia, serif',

  SCENE_NAMES: [
    'Moonlit Pond',
    'Sunny Meadow',
    'Whispering Forest',
    'Golden Sunset',
    'Stormy Marsh',
    'Misty Dawn',
    'Aurora Lake',
    'Cherry Blossom Brook',
    'Tropical Lagoon',
    'Cosmic Night'
  ],

  // Per-scene color grade tint, vignette strength, and water glint color
  GRADE: [
    { tint: 'rgba(40,70,160,0.10)',   vig: 0.55, glint: '200,225,255' },
    { tint: 'rgba(255,240,180,0.06)', vig: 0.28, glint: '255,255,235' },
    { tint: 'rgba(60,140,70,0.08)',   vig: 0.45, glint: '210,255,200' },
    { tint: 'rgba(255,120,40,0.08)',  vig: 0.45, glint: '255,225,160' },
    { tint: 'rgba(40,60,80,0.16)',    vig: 0.60, glint: '190,210,225' },
    { tint: 'rgba(255,190,200,0.07)', vig: 0.30, glint: '255,240,235' },
    { tint: 'rgba(40,200,150,0.07)',  vig: 0.55, glint: '170,255,220' },
    { tint: 'rgba(255,170,200,0.07)', vig: 0.30, glint: '255,225,235' },
    { tint: 'rgba(255,250,200,0.05)', vig: 0.25, glint: '240,255,250' },
    { tint: 'rgba(110,60,200,0.10)',  vig: 0.60, glint: '220,200,255' }
  ],

  ripples: [],

  // ---------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------

  _m(a, n) { return ((a % n) + n) % n; },

  // Horizontal pan of the background art for a given camera position
  // (must match Renderer.drawWater's parallax)
  bgShift(cameraX, levelWidth, W) {
    const range = Math.max(1, (levelWidth || W) - W);
    return Math.max(0, Math.min(1, cameraX / range)) * W * 0.15;
  },

  rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  },

  // Frosted glass panel
  panel(ctx, x, y, w, h, r, alpha) {
    ctx.save();
    this.rr(ctx, x, y, w, h, r);
    ctx.fillStyle = 'rgba(10,18,40,' + (alpha === undefined ? 0.62 : alpha) + ')';
    ctx.fill();
    const hi = ctx.createLinearGradient(0, y, 0, y + h);
    hi.addColorStop(0, 'rgba(255,255,255,0.16)');
    hi.addColorStop(0.45, 'rgba(255,255,255,0.02)');
    hi.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hi;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  },

  // Storybook gold lettering
  goldText(ctx, text, x, y, px, align, spacing) {
    ctx.save();
    ctx.font = '700 ' + px + 'px ' + this.FONT_HEAD;
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'alphabetic';
    if (spacing && 'letterSpacing' in ctx) ctx.letterSpacing = spacing + 'px';
    const g = ctx.createLinearGradient(0, y - px * 0.85, 0, y + px * 0.1);
    g.addColorStop(0, '#fff6c2');
    g.addColorStop(0.5, '#ffd24a');
    g.addColorStop(1, '#c98a12');
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = px * 0.25;
    ctx.shadowOffsetY = Math.max(1, px * 0.05);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(70,35,0,0.85)';
    ctx.lineWidth = Math.max(1.5, px * 0.07);
    ctx.strokeText(text, x, y);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = g;
    ctx.fillText(text, x, y);
    ctx.restore();
  },

  glow(ctx, x, y, r, rgb, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')');
    g.addColorStop(1, 'rgba(' + rgb + ',0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  },

  // Four-point sparkle
  star(ctx, x, y, r, rgb, a) {
    ctx.fillStyle = 'rgba(' + rgb + ',' + a + ')';
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.fill();
  },

  // ---------------------------------------------------------------
  // World-space helpers (call inside the camera transform)
  // ---------------------------------------------------------------

  addRipple(x, y, size) {
    if (this.ripples.length > 24) this.ripples.shift();
    this.ripples.push({ x: x, y: y, age: 0, life: 46, size: size || 28 });
  },

  updateRipples() {
    for (const r of this.ripples) r.age++;
    this.ripples = this.ripples.filter((r) => r.age < r.life);
  },

  drawRipples(ctx) {
    ctx.save();
    ctx.lineWidth = 1.5;
    for (const r of this.ripples) {
      for (let k = 0; k < 2; k++) {
        const t = (r.age - k * 9) / r.life;
        if (t <= 0 || t >= 1) continue;
        const rx = r.size * (0.35 + t * 1.1);
        ctx.strokeStyle = 'rgba(215,240,255,' + ((1 - t) * 0.5) + ')';
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, rx, rx * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  // Soft contact shadow under a grounded frog
  shadow(ctx, frog) {
    if (!frog.onGround) return;
    ctx.save();
    ctx.fillStyle = 'rgba(0,25,12,0.3)';
    ctx.beginPath();
    ctx.ellipse(frog.x + frog.width / 2, frog.y + frog.height + 1, 17, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  // Draw `fn` mirrored below the water line as a faint reflection
  reflect(ctx, lineY, alpha, fn) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(-1e5, lineY, 2e5, 300);
    ctx.clip();
    ctx.translate(0, lineY);
    ctx.scale(1, -0.7);
    ctx.translate(0, -lineY);
    ctx.globalAlpha = alpha;
    fn();
    ctx.restore();
  },

  // Golden beacon marking the prince (the goal)
  beacon(ctx, prince, time) {
    const cx = prince.x + prince.width / 2;
    const cy = prince.y + 14;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const pulse = 0.2 + Math.sin(time * 0.003) * 0.07;
    this.glow(ctx, cx, cy, 70, '255,215,110', pulse);
    // Slow rotating rays
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.0004);
    ctx.fillStyle = 'rgba(255,225,140,0.07)';
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-7, -78);
      ctx.lineTo(7, -78);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Rising sparkles
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const p = this._m(time * 0.03 + i * 17, 80) / 80;
      const sx = cx + Math.sin(i * 2.3 + time * 0.002) * 24;
      const sy = cy + 28 - p * 80;
      this.star(ctx, sx, sy, 2 + (i % 3), '255,235,170', (1 - p) * 0.8);
    }
    ctx.restore();
  },

  // ---------------------------------------------------------------
  // Screen-space ambient layers
  // ---------------------------------------------------------------

  // Behind the action (sky/light effects). `shift` = Fx.bgShift(...)
  ambientBack(ctx, v, time, s, shift) {
    const W = v.width, H = v.height;
    ctx.save();

    if (s === 0 || s === 9) {
      // Twinkling stars
      const n = s === 9 ? 46 : 20;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < n; i++) {
        const x = this._m(i * 97.3 + Math.sin(i * 7.1) * 60 - shift * 0.5, W);
        const y = this._m(i * 53.7 + Math.cos(i * 4.3) * 40, H * 0.5);
        const a = Math.max(0, Math.sin(time * 0.002 + i * 1.7)) * 0.7;
        if (a > 0.05) this.star(ctx, x, y, 1.5 + (i % 3), s === 9 ? '225,210,255' : '220,235,255', a);
      }
      if (s === 9) {
        // Shooting stars
        for (let k = 0; k < 2; k++) {
          const cyc = 5200 + k * 3100;
          const p = this._m(time + k * 2400, cyc) / cyc;
          if (p < 0.1) {
            const q = p / 0.1;
            const x = W * (0.15 + k * 0.45) + q * W * 0.32;
            const y = H * (0.06 + k * 0.08) + q * H * 0.16;
            const a = Math.sin(q * Math.PI);
            const tail = ctx.createLinearGradient(x, y, x - 60, y - 30);
            tail.addColorStop(0, 'rgba(235,225,255,' + a + ')');
            tail.addColorStop(1, 'rgba(235,225,255,0)');
            ctx.strokeStyle = tail;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 60, y - 30); ctx.stroke();
            this.glow(ctx, x, y, 9, '235,225,255', a * 0.8);
          }
        }
      }
    } else if (s === 2) {
      // Light shafts through the canopy
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 4; i++) {
        const x0 = W * (0.2 + i * 0.22) - shift * 0.6;
        const w = 40 + i * 14;
        const a = 0.045 + Math.sin(time * 0.0007 + i * 1.9) * 0.02;
        const g = ctx.createLinearGradient(0, 0, 0, H * 0.7);
        g.addColorStop(0, 'rgba(230,255,200,' + a + ')');
        g.addColorStop(1, 'rgba(230,255,200,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x0, 0); ctx.lineTo(x0 + w, 0);
        ctx.lineTo(x0 + w - 150, H * 0.7); ctx.lineTo(x0 - 170, H * 0.7);
        ctx.closePath(); ctx.fill();
      }
    } else if (s === 3) {
      // Flock of birds crossing the sunset
      ctx.strokeStyle = 'rgba(40,15,20,0.55)';
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const x = this._m(time * 0.018 + i * 46 + (i % 2) * 14, W + 160) - 80;
        const y = H * 0.16 + (i % 3) * 16 + Math.sin(time * 0.0015 + i) * 6;
        const flap = Math.sin(time * 0.012 + i * 1.4) * 4;
        ctx.beginPath();
        ctx.moveTo(x - 7, y - flap);
        ctx.quadraticCurveTo(x - 3, y - 2, x, y + 1);
        ctx.quadraticCurveTo(x + 3, y - 2, x + 7, y - flap);
        ctx.stroke();
      }
    } else if (s === 4) {
      // Lightning: brief, dim sky flash plus a bolt (kept gentle)
      const cyc = 6500;
      const t = this._m(time, cyc);
      const seed = Math.floor(time / cyc);
      const flash = t < 110 ? 1 - t / 110 : (t > 190 && t < 290 ? (1 - (t - 190) / 100) * 0.6 : 0);
      if (flash > 0) {
        ctx.fillStyle = 'rgba(210,225,255,' + (flash * 0.16) + ')';
        ctx.fillRect(0, 0, W, H * 0.62);
        if (t < 110) {
          let bx = W * (0.2 + this._m(seed * 0.37, 0.6));
          let by = 0;
          ctx.strokeStyle = 'rgba(235,240,255,' + (flash * 0.8) + ')';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(bx, by);
          for (let k = 0; k < 7; k++) {
            bx += Math.sin(seed * 12.9 + k * 4.7) * 26;
            by += 32;
            ctx.lineTo(bx, by);
          }
          ctx.stroke();
        }
      }
    } else if (s === 6) {
      // Aurora ribbons
      ctx.globalCompositeOperation = 'lighter';
      for (let a = 0; a < 3; a++) {
        const col = a === 0 ? '40,255,150' : a === 1 ? '150,90,255' : '60,200,255';
        const baseY = H * (0.07 + a * 0.08);
        const hgt = H * (0.2 + a * 0.03);
        const wave = (x) => Math.sin(x * 0.008 + time * 0.0005 + a * 2) * 20
          + Math.sin(x * 0.017 + time * 0.0008 + a * 4) * 10;
        ctx.beginPath();
        ctx.moveTo(0, baseY + wave(0));
        for (let x = 8; x <= W; x += 8) ctx.lineTo(x, baseY + wave(x));
        for (let x = W; x >= 0; x -= 8) ctx.lineTo(x, baseY + hgt + wave(x) * 0.5);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, baseY - 20, 0, baseY + hgt + 20);
        const al = 0.09 + Math.sin(time * 0.0006 + a * 2.2) * 0.03;
        g.addColorStop(0, 'rgba(' + col + ',0)');
        g.addColorStop(0.3, 'rgba(' + col + ',' + al + ')');
        g.addColorStop(1, 'rgba(' + col + ',0)');
        ctx.fillStyle = g;
        ctx.fill();
      }
    } else if (s === 8) {
      // Rotating sun rays from the painted sun
      const sx = W * 0.68 - shift, sy = H * 0.088;
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(sx, sy);
      ctx.rotate(Math.sin(time * 0.0002) * 0.15);
      for (let i = 0; i < 9; i++) {
        const ang = 0.35 + i * 0.3;
        const a = 0.035 + Math.sin(time * 0.001 + i * 1.3) * 0.015;
        const g = ctx.createLinearGradient(0, 0, Math.cos(ang) * 420, Math.sin(ang) * 420);
        g.addColorStop(0, 'rgba(255,250,210,' + a + ')');
        g.addColorStop(1, 'rgba(255,250,210,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ang - 0.05) * 420, Math.sin(ang - 0.05) * 420);
        ctx.lineTo(Math.cos(ang + 0.05) * 420, Math.sin(ang + 0.05) * 420);
        ctx.closePath(); ctx.fill();
      }
    }

    ctx.restore();
  },

  _butterflies(ctx, W, time, camX, cols) {
    for (let i = 0; i < cols.length; i++) {
      const x = this._m(time * 0.028 * (1 + i * 0.35) + i * 380 - camX * 0.6, W + 100) - 50;
      const y = 190 + i * 45 + Math.sin(time * 0.002 + i * 2.2) * 45 + Math.sin(time * 0.007 + i) * 8;
      const flap = Math.abs(Math.sin(time * 0.02 + i * 1.7));
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(time * 0.003 + i) * 0.3);
      ctx.fillStyle = cols[i];
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(side * 4.5 * flap, -2, 5 * flap + 0.6, 5, side * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(side * 3.5 * flap, 3, 3.5 * flap + 0.5, 3, side * -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(40,30,20,0.9)';
      ctx.fillRect(-0.8, -5, 1.6, 10);
      ctx.restore();
    }
  },

  _falling(ctx, W, H, time, camX, n, draw) {
    for (let i = 0; i < n; i++) {
      const period = 5200 + (i % 7) * 700;
      const ph = this._m(time + i * 613, period) / period;
      const x = this._m(i * 71.3 + Math.sin(time * 0.0009 + i * 1.7) * 38 + ph * 60 - camX * 0.4, W + 40) - 20;
      const y = -12 + ph * (H * 0.86);
      draw(i, x, y, time * 0.002 + i * 1.3, Math.min(1, (1 - ph) * 4));
    }
  },

  // In front of the action (weather, drifting life, water glints)
  ambientFront(ctx, v, time, s, camX) {
    const W = v.width, H = v.height;
    ctx.save();

    // Water glints twinkling across the play water (not in the storm)
    if (s !== 4) {
      const rgb = (this.GRADE[s] || this.GRADE[0]).glint;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 16; i++) {
        const x = this._m(i * 173.3 - camX, W + 40) - 20;
        const y = 384 + (i * 37) % 104;
        const a = Math.max(0, Math.sin(time * 0.003 + i * 2.1)) * 0.55;
        if (a > 0.05) this.star(ctx, x, y, 2.5 + (i % 3), rgb, a);
      }
      ctx.restore();
    }

    if (s === 0) {
      // Fireflies
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 14; i++) {
        const x = this._m(i * 97 + Math.sin(time * 0.0006 + i * 2.5) * 50 - camX * 0.5, W + 60) - 30;
        const y = 235 + (i * 53) % 170 + Math.sin(time * 0.0011 + i * 3.1) * 22;
        const a = 0.35 + Math.sin(time * 0.004 + i * 1.9) * 0.35;
        if (a > 0.05) {
          this.glow(ctx, x, y, 11, '215,245,110', a * 0.5);
          ctx.fillStyle = 'rgba(240,255,170,' + a + ')';
          ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
        }
      }
    } else if (s === 1 || s === 8) {
      // Drifting pollen + butterflies
      for (let i = 0; i < 16; i++) {
        const x = this._m(i * 61.7 + time * 0.012 - camX * 0.5, W + 30) - 15;
        const y = this._m(i * 43.1 - time * 0.006 + Math.sin(time * 0.001 + i) * 14, H * 0.8) + 30;
        ctx.fillStyle = 'rgba(255,255,220,' + (0.25 + Math.sin(time * 0.002 + i) * 0.15) + ')';
        ctx.beginPath(); ctx.arc(x, y, 1.3 + (i % 2) * 0.6, 0, Math.PI * 2); ctx.fill();
      }
      this._butterflies(ctx, W, time, camX,
        s === 1 ? ['rgba(255,170,40,0.9)', 'rgba(250,250,255,0.9)']
                : ['rgba(60,170,255,0.9)', 'rgba(255,90,120,0.9)']);
    } else if (s === 2) {
      // Falling leaves
      const cols = ['110,170,50', '190,170,40', '210,120,40'];
      this._falling(ctx, W, H, time, camX, 13, (i, x, y, rot, a) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
        ctx.fillStyle = 'rgba(' + cols[i % 3] + ',' + (0.75 * a) + ')';
        ctx.beginPath(); ctx.ellipse(0, 0, 4.5 + (i % 3), 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
    } else if (s === 3 || s === 9) {
      // Glowing motes (warm dust / stardust)
      ctx.globalCompositeOperation = 'lighter';
      const rgb = s === 3 ? '255,190,110' : '200,170,255';
      for (let i = 0; i < 16; i++) {
        const x = this._m(i * 83.3 + time * 0.008 - camX * 0.5, W + 40) - 20;
        const y = this._m(i * 59.9 - time * 0.005 + Math.sin(time * 0.0012 + i * 2) * 18, H * 0.85) + 20;
        const a = 0.2 + Math.sin(time * 0.0025 + i * 1.3) * 0.18;
        if (a > 0.04) this.glow(ctx, x, y, 5 + (i % 3) * 2, rgb, a);
      }
    } else if (s === 4) {
      // Rain + splash rings on the water
      ctx.strokeStyle = 'rgba(190,210,230,0.38)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 90; i++) {
        const x = this._m(i * 37.7 - time * 0.22 - camX * 0.3, W + 40) - 20;
        const y = this._m(i * 61.3 + time * 0.75, H + 30) - 30;
        ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 15);
      }
      ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const cyc = 900 + (i % 4) * 230;
        const p = this._m(time + i * 377, cyc) / cyc;
        const gen = Math.floor((time + i * 377) / cyc);
        const x = this._m(i * 131 + gen * 71.7 - camX, W);
        const y = 386 + this._m(i * 29 + gen * 13, 100);
        ctx.strokeStyle = 'rgba(210,225,240,' + ((1 - p) * 0.4) + ')';
        ctx.beginPath(); ctx.ellipse(x, y, 2 + p * 10, 0.8 + p * 3, 0, 0, Math.PI * 2); ctx.stroke();
      }
    } else if (s === 5) {
      // Drifting mist bands
      for (let i = 0; i < 3; i++) {
        const cx = this._m(time * (0.01 + i * 0.004) + i * 330 - camX * 0.3, W + 600) - 300;
        const y = 300 + i * 45 + Math.sin(time * 0.0004 + i * 2) * 10;
        ctx.save();
        ctx.translate(cx, y);
        ctx.scale(1, 0.14);
        this.glow(ctx, 0, 0, 300, '245,230,235', 0.2 - i * 0.03);
        ctx.restore();
      }
    } else if (s === 6) {
      // Light snowfall
      this._falling(ctx, W, H, time, camX, 26, (i, x, y, rot, a) => {
        ctx.fillStyle = 'rgba(235,245,255,' + (0.6 * a) + ')';
        ctx.beginPath(); ctx.arc(x, y, 1 + (i % 3) * 0.6, 0, Math.PI * 2); ctx.fill();
      });
    } else if (s === 7) {
      // Cherry petals
      this._falling(ctx, W, H, time, camX, 24, (i, x, y, rot, a) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
        ctx.fillStyle = 'rgba(' + (i % 2 ? '255,190,210' : '250,160,190') + ',' + (0.8 * a) + ')';
        ctx.beginPath(); ctx.ellipse(0, 0, 3.6, 1.9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
    }

    ctx.restore();
  },

  // Color grade + vignette over the whole frame
  post(ctx, v, s) {
    const W = v.width, H = v.height;
    const g = this.GRADE[s] || this.GRADE[0];
    ctx.save();
    ctx.fillStyle = g.tint;
    ctx.fillRect(0, 0, W, H);
    const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.32, W / 2, H / 2, W * 0.72);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,10,' + g.vig + ')');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
};
