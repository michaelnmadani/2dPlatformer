const Renderer = {

  drawWater(ctx, canvas, time, cameraX) {
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#1a3a5c');
    grad.addColorStop(1, '#0a1a3c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const waterY = canvas.height * 0.7;
    const colors = ['rgba(30,80,140,0.4)', 'rgba(20,60,120,0.3)', 'rgba(10,40,100,0.2)'];
    const speeds = [0.002, 0.0015, 0.001];
    const amplitudes = [8, 5, 3];
    const offsets = [0, 50, 100];

    for (let layer = 0; layer < 3; layer++) {
      ctx.beginPath();
      const y0 = waterY + layer * 15;
      ctx.moveTo(0, y0);
      for (let x = 0; x <= canvas.width; x += 4) {
        const worldX = x + cameraX;
        const sy = y0 + Math.sin(worldX * 0.02 + time * speeds[layer] + offsets[layer]) * amplitudes[layer]
                      + Math.sin(worldX * 0.01 + time * speeds[layer] * 0.7) * amplitudes[layer] * 0.5;
        ctx.lineTo(x, sy);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fillStyle = colors[layer];
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(5,20,50,0.6)';
    ctx.fillRect(0, waterY + 45, canvas.width, canvas.height - waterY - 45);
    ctx.restore();
  },

  drawLilypad(ctx, pad) {
    ctx.save();
    if (pad.opacity !== undefined && pad.opacity < 1) {
      ctx.globalAlpha = pad.opacity;
    }
    const cx = pad.x;
    const cy = pad.y;
    const rx = (pad.width || 60) / 2;
    const ry = 12;

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0.3, Math.PI * 2 - 0.3);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = '#2d8a4e';
    ctx.fill();
    ctx.strokeStyle = '#1e6b38';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Vein lines
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - rx * 0.6, cy - ry * 0.5);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - rx * 0.5, cy + ry * 0.6);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + rx * 0.7, cy - ry * 0.3);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + rx * 0.7, cy + ry * 0.4);
    ctx.strokeStyle = 'rgba(30,107,56,0.5)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    if (pad.hasFlower) {
      const fx = cx + rx * 0.3;
      const fy = cy - ry * 0.8;
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(fx + Math.cos(angle) * 4, fy + Math.sin(angle) * 4, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ff88aa';
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffdd44';
      ctx.fill();
    }

    ctx.restore();
  },

  drawFrog(ctx, frog, time) {
    ctx.save();
    ctx.translate(frog.x, frog.y);
    if (frog.facing === -1) {
      ctx.scale(-1, 1);
    }

    const jumping = frog.vy < 0;
    const falling = frog.vy > 0;

    // Back legs
    ctx.strokeStyle = '#2a7722';
    ctx.lineWidth = 3;
    if (jumping) {
      // Extended downward
      ctx.beginPath();
      ctx.moveTo(-8, 8);
      ctx.lineTo(-14, 20);
      ctx.lineTo(-10, 28);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, 8);
      ctx.lineTo(14, 20);
      ctx.lineTo(10, 28);
      ctx.stroke();
    } else if (falling) {
      // Spread out
      ctx.beginPath();
      ctx.moveTo(-8, 6);
      ctx.lineTo(-18, 14);
      ctx.lineTo(-22, 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, 6);
      ctx.lineTo(18, 14);
      ctx.lineTo(22, 8);
      ctx.stroke();
    } else {
      // Sitting bent legs
      ctx.beginPath();
      ctx.moveTo(-8, 6);
      ctx.lineTo(-16, 0);
      ctx.lineTo(-14, 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, 6);
      ctx.lineTo(16, 0);
      ctx.lineTo(14, 10);
      ctx.stroke();
    }

    // Front arms
    ctx.lineWidth = 2;
    if (jumping || falling) {
      ctx.beginPath();
      ctx.moveTo(-6, -2);
      ctx.lineTo(-14, -6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(6, -2);
      ctx.lineTo(14, -6);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-8, 2);
      ctx.lineTo(-12, 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, 2);
      ctx.lineTo(12, 8);
      ctx.stroke();
    }

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#33aa22';
    ctx.fill();
    ctx.strokeStyle = '#2a7722';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Belly
    ctx.beginPath();
    ctx.ellipse(0, 3, 12, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#66cc44';
    ctx.fill();

    // Eyes
    ctx.beginPath();
    ctx.arc(-7, -10, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#227718';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(7, -10, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.stroke();

    // Pupils
    ctx.beginPath();
    ctx.arc(-6, -10, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(8, -10, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();

    // Smile
    ctx.beginPath();
    ctx.arc(0, -3, 6, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = '#1a5511';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  },

  drawFrogClothing(ctx, frog, level, time) {
    ctx.save();
    ctx.translate(frog.x, frog.y);
    if (frog.facing === -1) {
      ctx.scale(-1, 1);
    }

    time = time || 0;

    if (level >= 10) {
      ctx.shadowColor = 'gold';
      ctx.shadowBlur = 15;
    }

    // Level 2: Crown
    if (level >= 2) {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(-8, -15);
      ctx.lineTo(-8, -22);
      ctx.lineTo(-4, -18);
      ctx.lineTo(0, -25);
      ctx.lineTo(4, -18);
      ctx.lineTo(8, -22);
      ctx.lineTo(8, -15);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#cca600';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Level 3: Bowtie (below mouth)
    if (level >= 3) {
      ctx.fillStyle = '#cc2222';
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-6, 8);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.lineTo(6, 0);
      ctx.lineTo(6, 8);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 4, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Level 4: Monocle
    if (level >= 4) {
      // Monocle lens on right eye
      ctx.strokeStyle = '#cca600';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(7, -10, 7, 0, Math.PI * 2);
      ctx.stroke();
      // Glass glint
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(5, -12, 2, 0.3, 1.2);
      ctx.stroke();
      // Chain hanging down
      ctx.strokeStyle = '#cca600';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(13, -7);
      ctx.quadraticCurveTo(16, 2, 12, 8);
      ctx.stroke();
    }

    // Level 5: Cape (behind frog, flows when jumping/falling)
    if (level >= 5) {
      const inAir = frog.vy !== 0;
      const wave = Math.sin(time * 0.005) * 4;
      const facing = frog.facing || 1;

      if (inAir) {
        // Flowing cape behind the frog when airborne
        const capeDir = -facing;
        const baseX = capeDir * 10;
        ctx.fillStyle = 'rgba(200,30,30,0.8)';
        ctx.beginPath();
        ctx.moveTo(capeDir * 4, -8);
        ctx.lineTo(capeDir * 6, -10);
        ctx.quadraticCurveTo(baseX + capeDir * 12 + wave, -2, baseX + capeDir * 16 + wave * 1.5, 10);
        ctx.quadraticCurveTo(baseX + capeDir * 8 + wave * 0.5, 14, capeDir * 2, 8);
        ctx.closePath();
        ctx.fill();
        // Cape edge highlight
        ctx.strokeStyle = 'rgba(255,80,80,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Draped behind the frog when grounded — small visible edge
        ctx.fillStyle = 'rgba(200,30,30,0.6)';
        ctx.beginPath();
        ctx.moveTo(-8, -6);
        ctx.lineTo(-10, -8);
        ctx.lineTo(-12 + wave * 0.3, 10);
        ctx.lineTo(-6, 8);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Level 6: Pants
    if (level >= 6) {
      ctx.fillStyle = '#1a4a8a';
      ctx.fillRect(-10, 6, 8, 10);
      ctx.fillRect(2, 6, 8, 10);
    }

    // Level 7: Boots
    if (level >= 7) {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-12, 13, 8, 5);
      ctx.fillRect(4, 13, 8, 5);
    }

    // Level 8: Gloves
    if (level >= 8) {
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(-12, 8, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(12, 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Level 9: Scepter
    if (level >= 9) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(14, 6);
      ctx.lineTo(18, -20);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(18, -22, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD700';
      ctx.fill();
      ctx.strokeStyle = '#cca600';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  },

  drawPrince(ctx, prince, time) {
    ctx.save();
    ctx.translate(prince.x, prince.y);

    const bob = Math.sin(time * 0.003) * 2;
    const tp = prince.transformProgress || 0;

    // Interpolate toward frog shape
    const bodyHeight = 30 * (1 - tp * 0.5);
    const bodyWidth = 16 * (1 + tp * 0.3);
    const headRadius = 10 * (1 - tp * 0.2);
    const greenMix = tp;

    const skinR = Math.round(255 * (1 - greenMix) + 51 * greenMix);
    const skinG = Math.round(218 * (1 - greenMix) + 170 * greenMix);
    const skinB = Math.round(185 * (1 - greenMix) + 34 * greenMix);
    const skinColor = `rgb(${skinR},${skinG},${skinB})`;

    const robeR = Math.round(40 * (1 - greenMix) + 45 * greenMix);
    const robeG = Math.round(60 * (1 - greenMix) + 130 * greenMix);
    const robeB = Math.round(150 * (1 - greenMix) + 40 * greenMix);
    const robeColor = `rgb(${robeR},${robeG},${robeB})`;

    ctx.translate(0, bob);

    // Robe/body
    ctx.fillStyle = robeColor;
    ctx.fillRect(-bodyWidth / 2, -5, bodyWidth, bodyHeight);

    // Arms
    ctx.strokeStyle = robeColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth / 2, 2);
    ctx.lineTo(-bodyWidth / 2 - 8, 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bodyWidth / 2, 2);
    ctx.lineTo(bodyWidth / 2 + 8, 14);
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(0, -10, headRadius, 0, Math.PI * 2);
    ctx.fillStyle = skinColor;
    ctx.fill();

    // Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(-3, -12, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3, -12, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-2.5, -12, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3.5, -12, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.beginPath();
    ctx.arc(0, -8, 3, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = '#884422';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Crown
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(-7, -18);
    ctx.lineTo(-7, -24);
    ctx.lineTo(-3, -20);
    ctx.lineTo(0, -26);
    ctx.lineTo(3, -20);
    ctx.lineTo(7, -24);
    ctx.lineTo(7, -18);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },

  drawDragonfly(ctx, df, time) {
    ctx.save();
    ctx.translate(df.x, df.y);

    const flapAngle = Math.sin(time * 0.01) * 0.5;

    // Body
    ctx.fillStyle = '#4466aa';
    ctx.beginPath();
    ctx.ellipse(0, 0, 3, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = 'rgba(150,200,255,0.35)';
    ctx.strokeStyle = 'rgba(100,150,220,0.4)';
    ctx.lineWidth = 0.5;

    // Top-left wing
    ctx.save();
    ctx.rotate(-0.3 + flapAngle);
    ctx.beginPath();
    ctx.ellipse(-8, -2, 10, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Top-right wing
    ctx.save();
    ctx.rotate(0.3 - flapAngle);
    ctx.beginPath();
    ctx.ellipse(8, -2, 10, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Bottom-left wing
    ctx.save();
    ctx.rotate(-0.1 + flapAngle * 0.7);
    ctx.beginPath();
    ctx.ellipse(-7, 2, 8, 2.5, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Bottom-right wing
    ctx.save();
    ctx.rotate(0.1 - flapAngle * 0.7);
    ctx.beginPath();
    ctx.ellipse(7, 2, 8, 2.5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Eyes
    ctx.fillStyle = '#88ccff';
    ctx.beginPath();
    ctx.arc(-2, -7, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(2, -7, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawParticle(ctx, p) {
    ctx.save();
    ctx.globalAlpha = p.life !== undefined ? p.life : 1;

    if (p.type === 'heart') {
      ctx.fillStyle = 'red';
      const s = p.size || 5;
      const x = p.x;
      const y = p.y;
      ctx.beginPath();
      ctx.moveTo(x, y + s * 0.3);
      ctx.bezierCurveTo(x, y - s * 0.3, x - s, y - s * 0.3, x - s, y + s * 0.2);
      ctx.bezierCurveTo(x - s, y + s * 0.7, x, y + s, x, y + s * 1.2);
      ctx.bezierCurveTo(x, y + s, x + s, y + s * 0.7, x + s, y + s * 0.2);
      ctx.bezierCurveTo(x + s, y - s * 0.3, x, y - s * 0.3, x, y + s * 0.3);
      ctx.closePath();
      ctx.fill();
    } else if (p.type === 'splash') {
      ctx.fillStyle = 'rgba(100,180,255,0.8)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'sparkle') {
      ctx.fillStyle = '#ffdd44';
      const s = p.size || 4;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - s);
      ctx.lineTo(p.x + s * 0.3, p.y - s * 0.3);
      ctx.lineTo(p.x + s, p.y);
      ctx.lineTo(p.x + s * 0.3, p.y + s * 0.3);
      ctx.lineTo(p.x, p.y + s);
      ctx.lineTo(p.x - s * 0.3, p.y + s * 0.3);
      ctx.lineTo(p.x - s, p.y);
      ctx.lineTo(p.x - s * 0.3, p.y - s * 0.3);
      ctx.closePath();
      ctx.fill();
    } else if (p.type === 'wind') {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x - (p.size || 8), p.y);
      ctx.lineTo(p.x + (p.size || 8), p.y);
      ctx.stroke();
    }

    ctx.restore();
  },

  drawHUD(ctx, level, lives, canvas) {
    ctx.save();

    // Level text
    ctx.font = '20px Georgia';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText('Level ' + level, 11, 31);
    ctx.fillStyle = 'white';
    ctx.fillText('Level ' + level, 10, 30);

    // Lives as hearts
    for (let i = 0; i < lives; i++) {
      const hx = canvas.width - 30 - i * 28;
      const hy = 20;
      ctx.fillStyle = '#ee3344';
      ctx.beginPath();
      ctx.moveTo(hx, hy + 3);
      ctx.bezierCurveTo(hx, hy - 2, hx - 7, hy - 2, hx - 7, hy + 2);
      ctx.bezierCurveTo(hx - 7, hy + 7, hx, hy + 11, hx, hy + 13);
      ctx.bezierCurveTo(hx, hy + 11, hx + 7, hy + 7, hx + 7, hy + 2);
      ctx.bezierCurveTo(hx + 7, hy - 2, hx, hy - 2, hx, hy + 3);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  },

  drawTitleScreen(ctx, canvas, time) {
    ctx.save();

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0a1a3c');
    grad.addColorStop(1, '#1a3a5c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animated water at bottom
    const waterY = canvas.height * 0.75;
    for (let layer = 0; layer < 3; layer++) {
      ctx.beginPath();
      ctx.moveTo(0, waterY + layer * 12);
      for (let x = 0; x <= canvas.width; x += 4) {
        const sy = waterY + layer * 12 + Math.sin(x * 0.02 + time * 0.002 + layer * 40) * 6;
        ctx.lineTo(x, sy);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fillStyle = `rgba(20,${60 + layer * 15},${120 + layer * 20},${0.5 - layer * 0.1})`;
      ctx.fill();
    }

    // Simple frog on lilypad
    const frogX = canvas.width / 2;
    const frogY = waterY - 5;

    // Lilypad
    ctx.beginPath();
    ctx.ellipse(frogX, frogY + 10, 35, 10, 0, 0.3, Math.PI * 2 - 0.3);
    ctx.lineTo(frogX, frogY + 10);
    ctx.closePath();
    ctx.fillStyle = '#2d8a4e';
    ctx.fill();

    // Frog body
    ctx.beginPath();
    ctx.ellipse(frogX, frogY, 14, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#33aa22';
    ctx.fill();

    // Frog eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(frogX - 5, frogY - 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(frogX + 5, frogY - 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(frogX - 4, frogY - 8, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(frogX + 6, frogY - 8, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Title with glow
    ctx.textAlign = 'center';
    ctx.font = 'bold 48px Georgia';
    ctx.shadowColor = 'rgba(50,170,30,0.6)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#44aa22';
    ctx.fillText('FROG PRINCE', canvas.width / 2, canvas.height * 0.25);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = '18px Georgia';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('A Fairy Tale Platformer', canvas.width / 2, canvas.height * 0.25 + 40);

    // Blinking start text
    const alpha = (Math.sin(time * 0.003) + 1) / 2;
    ctx.globalAlpha = 0.3 + alpha * 0.7;
    ctx.font = '20px Georgia';
    ctx.fillStyle = 'white';
    ctx.fillText('Press SPACE or Click to Start', canvas.width / 2, canvas.height * 0.55);
    ctx.globalAlpha = 1;

    ctx.textAlign = 'left';
    ctx.restore();
  },

  drawLevelSelect(ctx, canvas, unlockedLevel, clothingNames) {
    ctx.save();

    // Dark gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0a0a2a');
    grad.addColorStop(1, '#1a1a4a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.textAlign = 'center';
    ctx.font = 'bold 32px Georgia';
    ctx.fillStyle = 'white';
    ctx.fillText('Select a Level', canvas.width / 2, 50);

    const btnW = 120;
    const btnH = 80;
    const gap = 20;
    const cols = 5;
    const rows = 2;
    const totalW = cols * btnW + (cols - 1) * gap;
    const startX = (canvas.width - totalW) / 2;
    const startY = 90;
    const buttons = [];

    for (let i = 0; i < 10; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const bx = startX + col * (btnW + gap);
      const by = startY + row * (btnH + gap);
      const level = i + 1;

      buttons.push({ x: bx, y: by, w: btnW, h: btnH, level: level });

      if (level <= unlockedLevel) {
        // Unlocked button
        ctx.fillStyle = '#2a6a2a';
        ctx.fillRect(bx, by, btnW, btnH);
        ctx.strokeStyle = '#4a9a4a';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, btnW, btnH);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Georgia';
        ctx.fillText('' + level, bx + btnW / 2, by + 35);

        if (clothingNames && clothingNames[i]) {
          ctx.font = '11px Georgia';
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fillText(clothingNames[i], bx + btnW / 2, by + 58);
        }
      } else {
        // Locked button
        ctx.fillStyle = '#444';
        ctx.fillRect(bx, by, btnW, btnH);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, btnW, btnH);

        // Lock symbol
        const lx = bx + btnW / 2;
        const ly = by + btnH / 2;
        ctx.fillStyle = '#888';
        ctx.fillRect(lx - 8, ly - 2, 16, 14);
        ctx.beginPath();
        ctx.arc(lx, ly - 4, 7, Math.PI, 0);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Keyhole
        ctx.beginPath();
        ctx.arc(lx, ly + 3, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#444';
        ctx.fill();
      }
    }

    ctx.textAlign = 'left';
    ctx.restore();
    return buttons;
  },

  drawLevelComplete(ctx, canvas, level, clothingName, time) {
    ctx.save();

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';

    // Level Complete
    ctx.font = 'bold 40px Georgia';
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = 'rgba(255,215,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText('Level Complete!', canvas.width / 2, canvas.height * 0.35);
    ctx.shadowBlur = 0;

    // Clothing earned
    ctx.font = '22px Georgia';
    ctx.fillStyle = 'white';
    ctx.fillText('You earned: ' + clothingName, canvas.width / 2, canvas.height * 0.48);

    // Blinking continue
    const alpha = (Math.sin(time * 0.003) + 1) / 2;
    ctx.globalAlpha = 0.3 + alpha * 0.7;
    ctx.font = '18px Georgia';
    ctx.fillStyle = 'white';
    ctx.fillText('Press SPACE to Continue', canvas.width / 2, canvas.height * 0.65);
    ctx.globalAlpha = 1;

    ctx.textAlign = 'left';
    ctx.restore();
  },

  drawGameOver(ctx, canvas) {
    ctx.save();

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';

    // SPLASH!
    ctx.font = 'bold 48px Georgia';
    ctx.fillStyle = '#ee3344';
    ctx.shadowColor = 'rgba(200,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText('SPLASH!', canvas.width / 2, canvas.height * 0.3);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = '22px Georgia';
    ctx.fillStyle = 'white';
    ctx.fillText('You fell in the pond!', canvas.width / 2, canvas.height * 0.42);

    // Retry
    ctx.font = '18px Georgia';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('Press SPACE to Try Again', canvas.width / 2, canvas.height * 0.58);
    ctx.fillText('Press ESC for Level Select', canvas.width / 2, canvas.height * 0.66);

    ctx.textAlign = 'left';
    ctx.restore();
  },

  drawWindIndicator(ctx, canvas, windForce) {
    if (windForce === 0) return;
    ctx.save();

    const cx = canvas.width / 2;
    const cy = 25;
    const dir = windForce > 0 ? 1 : -1;
    const len = Math.min(Math.abs(windForce) * 30, 50);

    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'white';

    // Arrow shaft
    ctx.beginPath();
    ctx.moveTo(cx - dir * len / 2, cy);
    ctx.lineTo(cx + dir * len / 2, cy);
    ctx.stroke();

    // Arrow head
    ctx.beginPath();
    ctx.moveTo(cx + dir * len / 2, cy);
    ctx.lineTo(cx + dir * (len / 2 - 8), cy - 5);
    ctx.lineTo(cx + dir * (len / 2 - 8), cy + 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },

  drawKissCutscene(ctx, canvas, frog, prince, progress, time) {
    ctx.save();

    // Dark overlay for scene
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const frogStartX = frog.x;
    const princeX = prince.x;
    const midX = (frogStartX + princeX) / 2;

    // Phase 1: Move frog toward prince (0-0.3)
    if (progress <= 0.3) {
      const t = progress / 0.3;
      const interpX = frogStartX + (princeX - frogStartX - 40) * t;
      const fakeFrog = Object.assign({}, frog, { x: interpX });
      this.drawFrog(ctx, fakeFrog, time);
      this.drawPrince(ctx, prince, time);
    }

    // Phase 2: Heart particles (0.3-0.5)
    if (progress > 0.3 && progress <= 0.5) {
      const closeFrog = Object.assign({}, frog, { x: princeX - 40 });
      this.drawFrog(ctx, closeFrog, time);
      this.drawPrince(ctx, prince, time);

      const t = (progress - 0.3) / 0.2;
      const heartCount = Math.floor(t * 8);
      for (let i = 0; i < heartCount; i++) {
        const hx = midX + Math.sin(i * 1.5 + time * 0.005) * 20;
        const hy = frog.y - 20 - i * 8 - Math.sin(time * 0.003 + i) * 5;
        this.drawParticle(ctx, { type: 'heart', x: hx, y: hy, size: 6, life: 0.8 });
      }
    }

    // Phase 3: White flash and transformation (0.5-0.8)
    if (progress > 0.5 && progress <= 0.8) {
      const t = (progress - 0.5) / 0.3;
      const transformPrince = Object.assign({}, prince, { transformProgress: t });
      const closeFrog = Object.assign({}, frog, { x: princeX - 40 });
      this.drawFrog(ctx, closeFrog, time);
      this.drawPrince(ctx, transformPrince, time);

      // White flash
      const flashAlpha = t < 0.33 ? t * 3 * 0.6 : (1 - (t - 0.33) / 0.67) * 0.6;
      ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Phase 4: Both as frogs, text (0.8-1.0)
    if (progress > 0.8) {
      const closeFrog = Object.assign({}, frog, { x: princeX - 40 });
      this.drawFrog(ctx, closeFrog, time);

      // Draw prince as a frog
      const princeFrog = {
        x: prince.x,
        y: prince.y,
        facing: -1,
        vy: 0
      };
      this.drawFrog(ctx, princeFrog, time);

      // Text
      ctx.textAlign = 'center';
      const t = (progress - 0.8) / 0.2;
      ctx.globalAlpha = Math.min(t * 2, 1);
      ctx.font = 'bold 36px Georgia';
      ctx.fillStyle = '#FFD700';
      ctx.shadowColor = 'rgba(255,215,0,0.6)';
      ctx.shadowBlur = 15;
      ctx.fillText("True Love's Kiss!", canvas.width / 2, canvas.height * 0.25);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
    }

    ctx.restore();
  }

};
