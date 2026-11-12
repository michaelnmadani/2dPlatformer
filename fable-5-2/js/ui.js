/**
 * ui.js - Screens and HUD for The Frog Prince FABLE 5.2
 *
 * Installs the UI drawing functions onto Renderer. All functions draw in
 * the 800x500 logical view passed as `view`.
 */
Object.assign(Renderer, {

  // Scene art filling the view with a slow drift (menu backdrops)
  _backdrop(ctx, view, key, time, dim) {
    const W = view.width, H = view.height;
    const img = Assets.get(key);
    if (img) {
      const s = 1.12;
      const dx = (Math.sin(time * 0.00012) * 0.5 + 0.5) * W * (s - 1);
      const dy = (Math.cos(time * 0.0001) * 0.5 + 0.5) * H * (s - 1);
      ctx.drawImage(img, -dx, -dy, W * s, H * s);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0a1a3c');
      g.addColorStop(1, '#1a3a5c');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.fillStyle = 'rgba(4,8,24,' + dim + ')';
    ctx.fillRect(0, 0, W, H);
  },

  _prompt(ctx, text, x, y, time, px) {
    ctx.save();
    ctx.globalAlpha = 0.55 + (Math.sin(time * 0.004) + 1) * 0.225;
    ctx.font = (px || 15) + 'px ' + Fx.FONT_BODY;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText(text, x + 1, y + 1);
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
    ctx.restore();
  },

  // -------------------------------------------------------------
  // HUD
  // -------------------------------------------------------------

  drawHUD(ctx, level, lives, view, o) {
    o = o || {};
    const W = view.width;
    const time = o.time || 0;
    ctx.save();

    // Level + scene name (top-left)
    Fx.panel(ctx, 12, 10, 196, 46, 23);
    Fx.goldText(ctx, 'LEVEL ' + level, 30, 31, 16, 'left', 1.5);
    ctx.font = 'italic 11.5px ' + Fx.FONT_BODY;
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.fillText(o.sceneName || '', 30, 47);

    // Hearts (top-right), with empty slots and a pop when one is lost
    const maxLives = o.maxLives || 5;
    const pw = maxLives * 26 + 16;
    const px = W - 12 - pw;
    Fx.panel(ctx, px, 10, pw, 36, 18);
    const heartImg = Assets.get('particle-heart');
    const sinceHit = o.hitTime ? time - o.hitTime : Infinity;
    for (let i = 0; i < maxLives; i++) {
      const hx = px + 21 + i * 26;
      const hy = 28;
      let size = 20, alpha = 1;
      if (i >= lives) {
        alpha = 0.2;
        if (i === lives && sinceHit < 500) {
          const k = sinceHit / 500;
          size = 20 + (1 - k) * 16;
          alpha = 0.2 + (1 - k) * 0.8;
        }
      } else {
        size = 20 + Math.sin(time * 0.004 + i * 0.7) * 1;
      }
      ctx.globalAlpha = alpha;
      if (heartImg) {
        ctx.drawImage(heartImg, hx - size / 2, hy - size / 2, size, size);
      } else {
        ctx.fillStyle = '#ee3344';
        ctx.beginPath(); ctx.arc(hx, hy, size * 0.4, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // Journey progress toward the prince (top-center)
    const tw = 190, tx = W / 2 - tw / 2, ty = 24;
    const prog = Math.max(0, Math.min(1, o.progress || 0));
    Fx.rr(ctx, tx - 4, ty - 4, tw + 8, 14, 7);
    ctx.fillStyle = 'rgba(10,18,40,0.6)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    if (prog > 0.01) {
      const pg = ctx.createLinearGradient(tx, 0, tx + tw, 0);
      pg.addColorStop(0, '#59d66b');
      pg.addColorStop(1, '#ffd24a');
      Fx.rr(ctx, tx, ty, tw * prog, 6, 3);
      ctx.fillStyle = pg;
      ctx.fill();
    }
    // Frog marker
    ctx.fillStyle = '#3fc24d';
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(tx + tw * prog, ty + 3, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Crown at the goal
    const cx = tx + tw + 14, cy = ty + 3;
    ctx.fillStyle = '#ffd24a';
    ctx.strokeStyle = 'rgba(70,35,0,0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy + 5); ctx.lineTo(cx - 7, cy - 4); ctx.lineTo(cx - 3.5, cy);
    ctx.lineTo(cx, cy - 6); ctx.lineTo(cx + 3.5, cy); ctx.lineTo(cx + 7, cy - 4);
    ctx.lineTo(cx + 7, cy + 5); ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Level intro banner
    const t = o.startTime !== undefined ? time - o.startTime : Infinity;
    if (t >= 0 && t < 2600) {
      const a = Math.min(1, t / 300) * Math.min(1, (2600 - t) / 500);
      const slide = (1 - Math.min(1, t / 400)) * 14;
      ctx.globalAlpha = a;
      const by = 150 - slide;
      const bg = ctx.createLinearGradient(0, 0, W, 0);
      bg.addColorStop(0, 'rgba(5,10,30,0)');
      bg.addColorStop(0.5, 'rgba(5,10,30,0.6)');
      bg.addColorStop(1, 'rgba(5,10,30,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, by - 46, W, 84);
      Fx.goldText(ctx, 'Level ' + level, W / 2, by, 40, 'center', 2);
      ctx.font = 'italic 18px ' + Fx.FONT_BODY;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fillText(o.sceneName || '', W / 2, by + 26);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  },

  drawWindIndicator(ctx, view, windForce, time) {
    if (!windForce) return;
    const W = view.width;
    const dir = windForce > 0 ? 1 : -1;
    time = time || 0;
    ctx.save();
    Fx.panel(ctx, W / 2 - 52, 44, 104, 22, 11, 0.5);
    ctx.font = '700 10px ' + Fx.FONT_HEAD;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText('WIND', W / 2 - 18 * dir, 59);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < 3; i++) {
      const ph = ((time * 0.004 + i / 3) % 1);
      const x = W / 2 + dir * (8 + ph * 30);
      ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.9;
      ctx.beginPath();
      ctx.moveTo(x - dir * 4, 51); ctx.lineTo(x, 55); ctx.lineTo(x - dir * 4, 59);
      ctx.stroke();
    }
    ctx.restore();
  },

  // -------------------------------------------------------------
  // Title
  // -------------------------------------------------------------

  drawTitleScreen(ctx, view, time) {
    const W = view.width, H = view.height;
    ctx.save();

    this._backdrop(ctx, view, 'bg-moonlit-night', time, 0.28);
    Fx.ambientBack(ctx, view, time, 0, 0);

    // Logo
    const logo = Assets.get('title-logo');
    const bobY = Math.sin(time * 0.0015) * 4;
    if (logo) {
      const lw = 360, lh = lw * (logo.height / logo.width);
      ctx.save();
      ctx.shadowColor = 'rgba(90,220,90,0.55)';
      ctx.shadowBlur = 30;
      ctx.drawImage(logo, (W - lw) / 2, 18 + bobY, lw, lh);
      ctx.restore();
      // The logo art reads "Frog Prince" — complete the title
      Fx.goldText(ctx, 'THE', W / 2 - 128, 62 + bobY, 20, 'center', 4);
    } else {
      Fx.goldText(ctx, 'The Frog Prince', W / 2, 130 + bobY, 54);
    }

    // Edition badge
    const by = 248;
    ctx.strokeStyle = 'rgba(255,210,74,0.7)';
    ctx.lineWidth = 1;
    for (const side of [-1, 1]) {
      const g = ctx.createLinearGradient(W / 2 + side * 108, 0, W / 2 + side * 230, 0);
      g.addColorStop(0, 'rgba(255,210,74,0.8)');
      g.addColorStop(1, 'rgba(255,210,74,0)');
      ctx.strokeStyle = g;
      ctx.beginPath(); ctx.moveTo(W / 2 + side * 108, by - 9); ctx.lineTo(W / 2 + side * 230, by - 9); ctx.stroke();
    }
    Fx.goldText(ctx, 'FABLE 5.2', W / 2, by, 30, 'center', 6);
    ctx.font = 'italic 15px ' + Fx.FONT_BODY;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.fillText('A Fairy Tale Platformer', W / 2, by + 24);

    // Regal frog on a lilypad, with reflection
    const padW = 110;
    const pad = { x: W / 2 - padW / 2, y: 392, width: padW, type: 'static', variant: 6, hasFlower: true, flowerType: 0, opacity: 1 };
    const bob = this._getWaterBob(pad.x, time);
    const frog = { x: W / 2 - 15, y: 392 - 28 + bob, width: 30, height: 28, facing: 1, vx: 0, vy: 0, onGround: true };
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    Fx.glow(ctx, W / 2, 370, 120, '120,230,140', 0.14);
    ctx.restore();
    this.drawLilypad(ctx, pad, time);
    Fx.shadow(ctx, frog);
    ctx.save();
    ctx.translate(W / 2, frog.y + 28);
    ctx.scale(1.5, 1.5);
    ctx.translate(-W / 2, -(frog.y + 28));
    this.drawFrog(ctx, frog, 10, time);
    ctx.restore();

    Fx.ambientFront(ctx, view, time, 0, 0);
    Fx.post(ctx, view, 0);

    // Start button
    const pulse = 1 + Math.sin(time * 0.004) * 0.02;
    ctx.save();
    ctx.translate(W / 2, 452);
    ctx.scale(pulse, pulse);
    Fx.panel(ctx, -150, -19, 300, 38, 19, 0.55);
    ctx.restore();
    this._prompt(ctx, 'Press SPACE or Click to Start', W / 2, 457, time, 16);

    ctx.restore();
  },

  // -------------------------------------------------------------
  // Level select
  // -------------------------------------------------------------

  drawLevelSelect(ctx, view, unlockedLevel, clothingNames, hardcoreMode, time, mouse) {
    const W = view.width;
    time = time || 0;
    ctx.save();

    this._backdrop(ctx, view, 'bg-cosmic-night', time, 0.55);
    Fx.ambientBack(ctx, view, time, 9, 0);

    // Header — each word drawn separately (hitboxes for the secret unlock)
    ctx.font = '700 30px ' + Fx.FONT_HEAD;
    const words = ['Select', 'a', 'Level'];
    const gapW = 12;
    const widths = words.map((w) => ctx.measureText(w).width);
    let wx = (W - (widths.reduce((s, w) => s + w, 0) + gapW * 2)) / 2;
    const wy = 84;
    const wordHitboxes = [];
    for (let i = 0; i < words.length; i++) {
      Fx.goldText(ctx, words[i], wx, wy, 30, 'left');
      wordHitboxes.push({ x: wx, y: wy - 28, w: widths[i], h: 36, index: i });
      wx += widths[i] + gapW;
    }

    // Level cards with scene thumbnails
    const cw = 136, ch = 100, gap = 14, cols = 5;
    const startX = (W - (cols * cw + (cols - 1) * gap)) / 2;
    const startY = 108;
    const buttons = [];
    for (let i = 0; i < 10; i++) {
      const level = i + 1;
      const bx = startX + (i % cols) * (cw + gap);
      const by = startY + Math.floor(i / cols) * (ch + gap);
      buttons.push({ x: bx, y: by, w: cw, h: ch, level: level });

      const unlocked = level <= unlockedLevel;
      const hover = unlocked && mouse &&
        mouse.x >= bx && mouse.x <= bx + cw && mouse.y >= by && mouse.y <= by + ch;

      ctx.save();
      if (hover) {
        ctx.translate(bx + cw / 2, by + ch / 2);
        ctx.scale(1.05, 1.05);
        ctx.translate(-(bx + cw / 2), -(by + ch / 2));
      }
      // Drop shadow
      Fx.rr(ctx, bx + 2, by + 4, cw, ch, 12);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fill();

      // Thumbnail (cover-fit crop of the scene art)
      ctx.save();
      Fx.rr(ctx, bx, by, cw, ch, 12);
      ctx.clip();
      const img = Assets.getSceneBg(i);
      if (img) {
        const sw = img.height * (cw / ch);
        ctx.drawImage(img, (img.width - sw) / 2, 0, sw, img.height, bx, by, cw, ch);
      } else {
        ctx.fillStyle = '#24405a';
        ctx.fillRect(bx, by, cw, ch);
      }
      const shade = ctx.createLinearGradient(0, by, 0, by + ch);
      shade.addColorStop(0, 'rgba(0,0,0,0.05)');
      shade.addColorStop(0.5, 'rgba(0,0,0,0.15)');
      shade.addColorStop(1, 'rgba(0,0,10,0.82)');
      ctx.fillStyle = shade;
      ctx.fillRect(bx, by, cw, ch);
      if (!unlocked) {
        ctx.fillStyle = 'rgba(12,14,30,0.74)';
        ctx.fillRect(bx, by, cw, ch);
      }
      ctx.restore();

      // Border
      Fx.rr(ctx, bx, by, cw, ch, 12);
      ctx.lineWidth = hover ? 2.5 : 1.5;
      ctx.strokeStyle = hover ? '#ffd24a' : (unlocked ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.14)');
      ctx.stroke();

      if (unlocked) {
        // Number badge
        ctx.beginPath(); ctx.arc(bx + 20, by + 20, 13, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(8,14,34,0.72)'; ctx.fill();
        ctx.strokeStyle = 'rgba(255,210,74,0.85)'; ctx.lineWidth = 1.2; ctx.stroke();
        Fx.goldText(ctx, '' + level, bx + 20, by + 25.5, 15);
        // Completed check
        if (level < unlockedLevel) {
          ctx.strokeStyle = '#7dffa0'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(bx + cw - 24, by + 19); ctx.lineTo(bx + cw - 19, by + 24); ctx.lineTo(bx + cw - 11, by + 14);
          ctx.stroke();
        }
        ctx.textAlign = 'left';
        ctx.font = '700 11px ' + Fx.FONT_HEAD;
        ctx.fillStyle = 'white';
        ctx.fillText(Fx.SCENE_NAMES[i], bx + 9, by + ch - 22);
        if (clothingNames && clothingNames[i]) {
          ctx.font = 'italic 10.5px ' + Fx.FONT_BODY;
          ctx.fillStyle = 'rgba(255,225,150,0.92)';
          ctx.fillText(clothingNames[i], bx + 9, by + ch - 9);
        }
      } else {
        // Lock
        const lx = bx + cw / 2, ly = by + ch / 2 + 2;
        ctx.strokeStyle = 'rgba(200,205,225,0.75)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(lx, ly - 6, 7, Math.PI, 0); ctx.stroke();
        Fx.rr(ctx, lx - 10, ly - 5, 20, 16, 3);
        ctx.fillStyle = 'rgba(200,205,225,0.75)'; ctx.fill();
        ctx.beginPath(); ctx.arc(lx, ly + 2, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(12,14,30,0.9)'; ctx.fill();
      }
      ctx.restore();
    }

    // "The End" button — only once all 10 levels are unlocked
    const rowY = startY + 2 * (ch + gap) + 8;
    let endBtn = null;
    if (unlockedLevel >= 10) {
      endBtn = { x: (W - 150) / 2, y: rowY, w: 150, h: 36 };
      Fx.panel(ctx, endBtn.x, endBtn.y, endBtn.w, endBtn.h, 18, 0.6);
      Fx.rr(ctx, endBtn.x, endBtn.y, endBtn.w, endBtn.h, 18);
      ctx.strokeStyle = 'rgba(255,210,74,0.9)'; ctx.lineWidth = 1.5; ctx.stroke();
      Fx.goldText(ctx, 'The End', W / 2, endBtn.y + 24, 16, 'center', 1);
    }

    // Mode toggle
    const tW = 220, tH = 40;
    const tX = (W - tW) / 2;
    const tY = rowY + (unlockedLevel >= 10 ? 48 : 8);
    Fx.panel(ctx, tX, tY, tW, tH, 20, 0.6);
    Fx.rr(ctx, tX, tY, tW, tH, 20);
    ctx.strokeStyle = hardcoreMode ? 'rgba(255,110,90,0.9)' : 'rgba(110,180,255,0.9)';
    ctx.lineWidth = 1.5; ctx.stroke();
    // Switch
    Fx.rr(ctx, tX + 16, tY + 12, 38, 16, 8);
    ctx.fillStyle = hardcoreMode ? 'rgba(255,90,70,0.45)' : 'rgba(90,160,255,0.35)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hardcoreMode ? tX + 46 : tX + 24, tY + 20, 9, 0, Math.PI * 2);
    ctx.fillStyle = hardcoreMode ? '#ff6655' : '#6ab4ff';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.font = '700 15px ' + Fx.FONT_HEAD;
    ctx.textAlign = 'left';
    ctx.fillStyle = 'white';
    ctx.fillText(hardcoreMode ? 'Hardcore' : 'Standard', tX + 70, tY + 26);
    ctx.font = 'italic 11.5px ' + Fx.FONT_BODY;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(
      hardcoreMode ? '5 lives for the whole journey — game over restarts from Level 1'
                   : '5 lives per level — game over retries the same level',
      W / 2, tY + tH + 18);

    Fx.ambientFront(ctx, view, time, 9, 0);
    Fx.post(ctx, view, 9);

    ctx.restore();
    return {
      buttons: buttons,
      toggle: { x: tX, y: tY, w: tW, h: tH },
      words: wordHitboxes,
      endBtn: endBtn
    };
  },

  // -------------------------------------------------------------
  // Overlays (drawn over the dimmed level scene)
  // -------------------------------------------------------------

  drawLevelComplete(ctx, view, level, clothingName, time) {
    const W = view.width, H = view.height;
    ctx.save();
    ctx.fillStyle = 'rgba(3,6,20,0.55)';
    ctx.fillRect(0, 0, W, H);

    const pw = 440, ph = 330, px = (W - pw) / 2, py = 78;
    Fx.panel(ctx, px, py, pw, ph, 22, 0.72);

    // Rotating rays + glow behind the frog
    const fx = W / 2, fy = 262;
    ctx.save();
    Fx.rr(ctx, px, py, pw, ph, 22);
    ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    Fx.glow(ctx, fx, fy - 20, 130, '255,215,110', 0.3);
    ctx.translate(fx, fy - 20);
    ctx.rotate(time * 0.0005);
    const rayFade = ctx.createRadialGradient(0, 0, 10, 0, 0, 190);
    rayFade.addColorStop(0, 'rgba(255,225,140,0.10)');
    rayFade.addColorStop(1, 'rgba(255,225,140,0)');
    ctx.fillStyle = rayFade;
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-13, -200); ctx.lineTo(13, -200); ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    Fx.goldText(ctx, 'Level Complete!', W / 2, py + 52, 34, 'center', 1);

    // The frog showing off the new outfit
    const pad = { x: fx - 50, y: fy, width: 100, type: 'static', variant: 0, hasFlower: false, opacity: 1 };
    const bob = this._getWaterBob(pad.x, time);
    const frog = { x: fx - 15, y: fy - 28 + bob, width: 30, height: 28, facing: 1, vx: 0, vy: 0, onGround: true };
    this.drawLilypad(ctx, pad, time);
    ctx.save();
    ctx.translate(fx, frog.y + 28);
    ctx.scale(1.9, 1.9);
    ctx.translate(-fx, -(frog.y + 28));
    this.drawFrog(ctx, frog, Math.min(10, level + 1), time);
    ctx.restore();

    // Orbiting sparkles
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 8; i++) {
      const a = time * 0.0012 + i * (Math.PI / 4);
      Fx.star(ctx, fx + Math.cos(a) * 92, fy - 30 + Math.sin(a) * 42, 3 + (i % 3),
        '255,235,170', 0.45 + Math.sin(time * 0.005 + i) * 0.35);
    }
    ctx.restore();

    ctx.font = '700 11px ' + Fx.FONT_HEAD;
    ctx.textAlign = 'center';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '3px';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText('NEW OUTFIT UNLOCKED', W / 2, py + 262);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    Fx.goldText(ctx, clothingName, W / 2, py + 290, 22);
    this._prompt(ctx, 'SPACE to continue   ·   Click for level select', W / 2, py + 316, time, 13);

    ctx.restore();
  },

  drawGameOver(ctx, view, campaignMode, time) {
    const W = view.width, H = view.height;
    time = time || 0;
    ctx.save();
    ctx.fillStyle = 'rgba(3,6,20,0.62)';
    ctx.fillRect(0, 0, W, H);

    const pw = 430, ph = 220, px = (W - pw) / 2, py = 130;
    Fx.panel(ctx, px, py, pw, ph, 22, 0.75);

    ctx.save();
    ctx.font = '700 46px ' + Fx.FONT_HEAD;
    ctx.textAlign = 'center';
    const g = ctx.createLinearGradient(0, py + 30, 0, py + 80);
    g.addColorStop(0, '#ffb0a8');
    g.addColorStop(1, '#e02848');
    ctx.shadowColor = 'rgba(230,40,60,0.6)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = g;
    ctx.fillText('SPLASH!', W / 2, py + 76);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.font = 'italic 19px ' + Fx.FONT_BODY;
    ctx.fillStyle = 'white';
    ctx.fillText(campaignMode ? 'You ran out of hearts!' : 'You fell in the pond!', W / 2, py + 116);

    this._prompt(ctx,
      campaignMode ? 'Press SPACE to restart from Level 1' : 'Press SPACE to try again',
      W / 2, py + 160, time, 16);
    ctx.font = '13px ' + Fx.FONT_BODY;
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillText('ESC for level select', W / 2, py + 188);

    ctx.restore();
  }
});
