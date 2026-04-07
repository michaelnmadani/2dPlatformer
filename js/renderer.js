const Renderer = {

  // Shared function to get water bob offset at a world X position
  _getWaterBob(worldX, time) {
    return Math.sin(worldX * 0.02 + time * 0.002) * 3
         + Math.sin(worldX * 0.013 + time * 0.0015) * 2;
  },

  drawWater(ctx, canvas, time, cameraX) {
    ctx.save();
    cameraX = cameraX || 0;

    // Sky gradient — dark twilight sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.65);
    skyGrad.addColorStop(0, '#0c1e3a');
    skyGrad.addColorStop(0.5, '#152d4f');
    skyGrad.addColorStop(1, '#1a3d5c');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.65);

    // Water body — deep gradient
    const waterTop = canvas.height * 0.62;
    const waterGrad = ctx.createLinearGradient(0, waterTop, 0, canvas.height);
    waterGrad.addColorStop(0, '#1a4a6c');
    waterGrad.addColorStop(0.3, '#133a58');
    waterGrad.addColorStop(0.7, '#0c2840');
    waterGrad.addColorStop(1, '#061828');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, waterTop, canvas.width, canvas.height - waterTop);

    // Animated wave layers (5 layers for depth)
    const waveLayers = [
      { y: waterTop - 5, color: 'rgba(40,100,160,0.35)', speed: 0.0022, freq: 0.018, amp: 6, freq2: 0.009, amp2: 4 },
      { y: waterTop + 5,  color: 'rgba(30,80,140,0.30)',  speed: 0.0018, freq: 0.022, amp: 5, freq2: 0.011, amp2: 3 },
      { y: waterTop + 15, color: 'rgba(22,65,120,0.25)',  speed: 0.0014, freq: 0.025, amp: 4, freq2: 0.013, amp2: 2.5 },
      { y: waterTop + 28, color: 'rgba(15,50,100,0.20)',  speed: 0.0010, freq: 0.028, amp: 3, freq2: 0.015, amp2: 2 },
      { y: waterTop + 42, color: 'rgba(10,35,80,0.15)',   speed: 0.0008, freq: 0.032, amp: 2.5, freq2: 0.017, amp2: 1.5 }
    ];

    for (const wl of waveLayers) {
      ctx.beginPath();
      ctx.moveTo(0, wl.y);
      for (let x = 0; x <= canvas.width; x += 3) {
        const wx = x + cameraX;
        const sy = wl.y
          + Math.sin(wx * wl.freq + time * wl.speed) * wl.amp
          + Math.sin(wx * wl.freq2 + time * wl.speed * 0.7 + 1.5) * wl.amp2
          + Math.sin(wx * 0.005 + time * 0.0005) * 2;
        ctx.lineTo(x, sy);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fillStyle = wl.color;
      ctx.fill();
    }

    // Subtle light caustic shimmer on water surface
    for (let i = 0; i < 12; i++) {
      const phase = time * 0.001 + i * 2.1;
      const sx = ((Math.sin(phase * 0.3 + i * 1.7) * 0.5 + 0.5) * (canvas.width + 100)) - 50;
      const sy = waterTop + 10 + Math.sin(phase * 0.5 + i) * 15;
      const alpha = (Math.sin(phase * 1.2) * 0.3 + 0.3) * 0.15;
      const sz = 20 + Math.sin(phase) * 10;
      ctx.beginPath();
      ctx.ellipse(sx, sy, sz, 3, Math.sin(phase * 0.2) * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(120,180,220,' + alpha + ')';
      ctx.fill();
    }

    // Dark depth at very bottom
    const depthGrad = ctx.createLinearGradient(0, canvas.height - 60, 0, canvas.height);
    depthGrad.addColorStop(0, 'rgba(4,12,30,0)');
    depthGrad.addColorStop(1, 'rgba(4,12,30,0.7)');
    ctx.fillStyle = depthGrad;
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

    ctx.restore();
  },

  // 10 lilypad color palettes
  _padVariants: [
    // 0: Classic green
    { inner: '#3aad5e', mid: '#2d8a4e', outer: '#1e6b38', edge: '#175a2e', vein: 'rgba(30,107,56,0.4)', highlight: 'rgba(140,220,150,0.15)' },
    // 1: Dark emerald
    { inner: '#2a9050', mid: '#1e7040', outer: '#155a30', edge: '#104a25', vein: 'rgba(20,90,40,0.4)', highlight: 'rgba(100,200,130,0.12)' },
    // 2: Yellow-green (young pad)
    { inner: '#60c060', mid: '#45a848', outer: '#2e8a35', edge: '#227528', vein: 'rgba(50,130,50,0.35)', highlight: 'rgba(180,240,160,0.18)' },
    // 3: Blue-green (cool)
    { inner: '#35a070', mid: '#2a8060', outer: '#1e6850', edge: '#155840', vein: 'rgba(25,100,65,0.4)', highlight: 'rgba(130,210,180,0.14)' },
    // 4: Olive green (aged)
    { inner: '#5a9a40', mid: '#4a8035', outer: '#3a6828', edge: '#2e5520', vein: 'rgba(60,100,35,0.4)', highlight: 'rgba(160,210,120,0.12)' },
    // 5: Rich green with brown tint
    { inner: '#3a9a50', mid: '#2e7a42', outer: '#226035', edge: '#1a5028', vein: 'rgba(35,95,45,0.45)', highlight: 'rgba(130,200,140,0.13)' },
    // 6: Bright spring green
    { inner: '#50c868', mid: '#3aaa55', outer: '#288a40', edge: '#1e7530', vein: 'rgba(40,140,55,0.35)', highlight: 'rgba(170,240,170,0.2)' },
    // 7: Deep forest green
    { inner: '#28854a', mid: '#1e6a3a', outer: '#14552c', edge: '#0e4520', vein: 'rgba(18,80,35,0.45)', highlight: 'rgba(100,180,120,0.1)' },
    // 8: Sage green (muted)
    { inner: '#6aaa6a', mid: '#558a55', outer: '#407040', edge: '#355a35', vein: 'rgba(60,110,60,0.35)', highlight: 'rgba(160,210,160,0.15)' },
    // 9: Teal-green
    { inner: '#30a878', mid: '#258868', outer: '#1a6a55', edge: '#125845', vein: 'rgba(22,105,70,0.4)', highlight: 'rgba(120,220,190,0.14)' }
  ],

  // 10 lilypad structural variations (notch angle, notch size, vein pattern, shape)
  _padShapes: [
    { notchStart: 0.3, notchEnd: 0.3, veins: [[-0.65,-0.55],[-0.55,0.6],[0.7,-0.35],[0.7,0.45],[-0.3,-0.75],[0.35,-0.7],[-0.8,0.1],[0.85,0.1]], spots: 3 },
    { notchStart: 0.2, notchEnd: 0.2, veins: [[-0.7,-0.4],[-0.6,0.5],[0.75,-0.25],[0.65,0.5],[-0.4,-0.8],[0.3,-0.75]], spots: 2 },
    { notchStart: 0.4, notchEnd: 0.4, veins: [[-0.5,-0.6],[-0.7,0.3],[0.6,-0.5],[0.8,0.2],[-0.2,-0.8],[0.4,-0.65],[-0.85,0.15],[0.75,0.45]], spots: 4 },
    { notchStart: 0.15, notchEnd: 0.15, veins: [[-0.6,-0.5],[-0.45,0.65],[0.55,-0.45],[0.7,0.4],[-0.35,-0.7],[0.25,-0.8],[0.9,0.05]], spots: 1 },
    { notchStart: 0.35, notchEnd: 0.25, veins: [[-0.7,-0.3],[-0.5,0.55],[0.65,-0.4],[0.6,0.55],[-0.25,-0.8],[0.4,-0.6],[-0.85,-0.1],[0.85,0.2]], spots: 3 },
    { notchStart: 0.25, notchEnd: 0.35, veins: [[-0.55,-0.6],[-0.65,0.4],[0.7,-0.3],[0.75,0.35],[-0.3,-0.75],[0.2,-0.8]], spots: 2 },
    { notchStart: 0.5, notchEnd: 0.5, veins: [[-0.6,-0.45],[-0.5,0.55],[0.6,-0.5],[0.65,0.5],[-0.4,-0.7],[0.35,-0.7],[-0.8,0.2],[0.8,0.15],[-0.75,0.4]], spots: 5 },
    { notchStart: 0.2, notchEnd: 0.3, veins: [[-0.7,-0.35],[-0.55,0.6],[0.7,-0.4],[0.7,0.4],[-0.85,0.05]], spots: 2 },
    { notchStart: 0.3, notchEnd: 0.2, veins: [[-0.6,-0.5],[-0.6,0.5],[0.65,-0.4],[0.65,0.45],[-0.3,-0.8],[0.3,-0.75],[-0.8,0.2],[0.85,0.1]], spots: 3 },
    { notchStart: 0.45, notchEnd: 0.35, veins: [[-0.55,-0.55],[-0.7,0.35],[0.7,-0.3],[0.55,0.6],[-0.2,-0.8],[0.45,-0.6],[-0.9,0.0],[0.9,0.0]], spots: 4 }
  ],

  // 5 flower types
  _drawFlower(ctx, fx, fy, flowerType, time) {
    ctx.save();
    ctx.translate(fx, fy);
    const t = time || 0;
    const sway = Math.sin(t * 0.002) * 0.08;
    ctx.rotate(sway);

    switch (flowerType) {
      case 0: // Water lily — white/pink layered petals
        // Outer petals
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + t * 0.0002;
          ctx.save();
          ctx.rotate(a);
          ctx.beginPath();
          ctx.ellipse(5.5, 0, 5, 2.5, 0, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? 'rgba(255,240,245,0.9)' : 'rgba(255,220,235,0.85)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(220,180,200,0.4)';
          ctx.lineWidth = 0.4;
          ctx.stroke();
          ctx.restore();
        }
        // Inner petals
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + 0.3 + t * 0.0003;
          ctx.save();
          ctx.rotate(a);
          ctx.beginPath();
          ctx.ellipse(3, 0, 3.5, 1.8, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,210,230,0.9)';
          ctx.fill();
          ctx.restore();
        }
        // Center stamens
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffdd44';
        ctx.fill();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0.6, 0, Math.PI * 2);
          ctx.fillStyle = '#ffaa22';
          ctx.fill();
        }
        break;

      case 1: // Lotus — pink with pointed petals
        for (let layer = 0; layer < 3; layer++) {
          const count = layer === 0 ? 8 : layer === 1 ? 6 : 4;
          const dist = layer === 0 ? 6 : layer === 1 ? 4 : 2.5;
          const petalW = layer === 0 ? 4.5 : layer === 1 ? 3.5 : 2.5;
          const petalH = layer === 0 ? 2 : layer === 1 ? 1.5 : 1.2;
          for (let i = 0; i < count; i++) {
            const a = (i / count) * Math.PI * 2 + layer * 0.2 + t * 0.00015;
            ctx.save();
            ctx.rotate(a);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(dist * 0.5, -petalH * 1.5, dist, 0);
            ctx.quadraticCurveTo(dist * 0.5, petalH * 1.5, 0, 0);
            const pink = layer === 0 ? '#e87aa0' : layer === 1 ? '#f090b0' : '#f5a8c0';
            ctx.fillStyle = pink;
            ctx.fill();
            ctx.strokeStyle = 'rgba(180,60,100,0.3)';
            ctx.lineWidth = 0.3;
            ctx.stroke();
            ctx.restore();
          }
        }
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffe066';
        ctx.fill();
        break;

      case 2: // Yellow pond lily
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + t * 0.0002;
          ctx.save();
          ctx.rotate(a);
          ctx.beginPath();
          ctx.ellipse(5, 0, 4.5, 2.2, 0, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? '#ffdd44' : '#ffcc22';
          ctx.fill();
          ctx.strokeStyle = 'rgba(200,160,0,0.3)';
          ctx.lineWidth = 0.4;
          ctx.stroke();
          ctx.restore();
        }
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + 0.4;
          ctx.save();
          ctx.rotate(a);
          ctx.beginPath();
          ctx.ellipse(2.5, 0, 2.5, 1.5, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#ffee66';
          ctx.fill();
          ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ee8800';
        ctx.fill();
        // Pollen dots
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#cc6600';
          ctx.fill();
        }
        break;

      case 3: // Purple water hyacinth
        // Stem cluster
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2 + t * 0.00025;
          const dist = 3 + (i % 2) * 2;
          ctx.save();
          ctx.rotate(a);
          ctx.translate(dist, 0);
          ctx.beginPath();
          ctx.ellipse(0, 0, 2.5, 1.8, a * 0.5, 0, Math.PI * 2);
          const purple = i % 3 === 0 ? '#9966cc' : i % 3 === 1 ? '#aa77dd' : '#bb88ee';
          ctx.fillStyle = purple;
          ctx.fill();
          // Petal detail line
          ctx.strokeStyle = 'rgba(100,50,150,0.3)';
          ctx.lineWidth = 0.3;
          ctx.stroke();
          ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffee88';
        ctx.fill();
        break;

      case 4: // Blue water forget-me-not cluster
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          const bx = Math.cos(a) * 4;
          const by = Math.sin(a) * 4;
          // Each small flower
          for (let p = 0; p < 5; p++) {
            const pa = (p / 5) * Math.PI * 2 + t * 0.0003;
            ctx.beginPath();
            ctx.ellipse(
              bx + Math.cos(pa) * 2,
              by + Math.sin(pa) * 2,
              1.8, 1.2, pa, 0, Math.PI * 2
            );
            ctx.fillStyle = p % 2 === 0 ? '#6699dd' : '#5588cc';
            ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(bx, by, 1, 0, Math.PI * 2);
          ctx.fillStyle = '#ffee66';
          ctx.fill();
        }
        // Central flower
        for (let p = 0; p < 5; p++) {
          const pa = (p / 5) * Math.PI * 2 + 0.3;
          ctx.beginPath();
          ctx.ellipse(Math.cos(pa) * 2.5, Math.sin(pa) * 2.5, 2, 1.3, pa, 0, Math.PI * 2);
          ctx.fillStyle = '#7788ee';
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffdd44';
        ctx.fill();
        break;
    }

    ctx.restore();
  },

  drawLilypad(ctx, pad, time) {
    ctx.save();
    time = time || 0;

    if (pad.opacity !== undefined && pad.opacity < 1) {
      ctx.globalAlpha = pad.opacity;
    }

    // Calculate water bob — lilypad gently moves with the water
    const worldX = pad.x + (pad.offsetX || 0);
    const bob = this._getWaterBob(worldX, time);
    const tilt = Math.sin(worldX * 0.015 + time * 0.0018) * 0.04;

    const cx = pad.x + (pad.offsetX || 0);
    const cy = pad.y + (pad.offsetY || 0) + bob;
    const rx = (pad.width || 60) / 2;
    const ry = 10;
    const v = pad.variant || 0;
    const colors = this._padVariants[v % 10];
    const shape = this._padShapes[v % 10];

    ctx.translate(cx, cy);
    ctx.rotate(tilt);

    // Shadow/reflection under the pad
    ctx.beginPath();
    ctx.ellipse(1, 4, rx + 2, ry + 1, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(5,20,40,0.25)';
    ctx.fill();

    // Main lilypad shape with variant notch size
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, shape.notchStart, Math.PI * 2 - shape.notchEnd);
    ctx.lineTo(0, 0);
    ctx.closePath();

    // Gradient fill using variant colors
    const padGrad = ctx.createRadialGradient(-rx * 0.2, -ry * 0.2, rx * 0.1, 0, 0, rx);
    padGrad.addColorStop(0, colors.inner);
    padGrad.addColorStop(0.5, colors.mid);
    padGrad.addColorStop(1, colors.outer);
    ctx.fillStyle = padGrad;
    ctx.fill();

    // Edge
    ctx.strokeStyle = colors.edge;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Inner ring
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.75, ry * 0.7, 0, shape.notchStart + 0.1, Math.PI * 2 - shape.notchEnd - 0.1);
    ctx.strokeStyle = 'rgba(80,180,100,0.2)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Vein lines from variant shape
    ctx.strokeStyle = colors.vein;
    ctx.lineWidth = 0.7;
    for (const vn of shape.veins) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const vx = vn[0] * rx;
      const vy = vn[1] * ry;
      ctx.quadraticCurveTo(vx * 0.5 + vy * 0.1, vy * 0.5 - vx * 0.05, vx, vy);
      ctx.stroke();
    }

    // Highlight
    ctx.beginPath();
    ctx.ellipse(-rx * 0.25, -ry * 0.3, rx * 0.3, ry * 0.25, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = colors.highlight;
    ctx.fill();

    // Spots/water droplets (count from variant)
    for (let d = 0; d < shape.spots; d++) {
      const dx = Math.sin(worldX + d * 47) * rx * 0.5;
      const dy = Math.cos(worldX + d * 31) * ry * 0.4;
      if (dx * dx / (rx * rx) + dy * dy / (ry * ry) < 0.55) {
        ctx.beginPath();
        ctx.arc(dx, dy, 1.2 + (d % 2) * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180,230,255,0.25)';
        ctx.fill();
      }
    }

    // Worn/aged marks on some variants
    if (v >= 4 && v <= 7) {
      const markAngle = v * 0.7 + 1;
      ctx.beginPath();
      ctx.ellipse(
        Math.cos(markAngle) * rx * 0.4,
        Math.sin(markAngle) * ry * 0.3,
        rx * 0.12, ry * 0.1, markAngle, 0, Math.PI * 2
      );
      ctx.fillStyle = 'rgba(80,60,30,0.08)';
      ctx.fill();
    }

    // Flower (5 types)
    if (pad.hasFlower) {
      this._drawFlower(ctx, rx * 0.3, -ry * 0.6, pad.flowerType || 0, time);
    }

    // Water ripple rings
    ctx.rotate(-tilt);
    const rippleAlpha = 0.08 + Math.sin(time * 0.002 + worldX) * 0.04;
    ctx.strokeStyle = 'rgba(100,180,220,' + rippleAlpha + ')';
    ctx.lineWidth = 0.6;
    const ripplePhase = (time * 0.001 + worldX * 0.01) % 1;
    const rippleScale = 1 + ripplePhase * 0.3;
    ctx.beginPath();
    ctx.ellipse(0, 2, rx * rippleScale + 4, ry * rippleScale + 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  },

  drawFish(ctx, fish, time) {
    ctx.save();
    time = time || 0;

    ctx.translate(fish.x, fish.y);
    // Flip based on direction
    if (fish.direction < 0) {
      ctx.scale(-1, 1);
    }

    // Underwater transparency — deeper fish are more transparent
    const depth = (fish.y - 420) / 60; // 0 at top, 1 at bottom
    ctx.globalAlpha = 0.45 - depth * 0.15;

    const bl = fish.bodyLen;
    const bh = fish.bodyH;
    const tw = fish.tailW;
    const th = fish.tailH;

    // Tail (wagging)
    ctx.save();
    ctx.translate(-bl * 0.4, 0);
    ctx.rotate(fish.tailAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-tw, -th * 0.5);
    ctx.quadraticCurveTo(-tw * 0.6, 0, -tw, th * 0.5);
    ctx.closePath();
    ctx.fillStyle = fish.finColor;
    ctx.fill();
    // Tail fin lines
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-1, 0);
    ctx.lineTo(-tw * 0.8, -th * 0.35);
    ctx.moveTo(-1, 0);
    ctx.lineTo(-tw * 0.8, th * 0.35);
    ctx.moveTo(-1, 0);
    ctx.lineTo(-tw * 0.9, 0);
    ctx.stroke();
    ctx.restore();

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, bl * 0.5, bh * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = fish.bodyColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Belly (lighter underside)
    ctx.beginPath();
    ctx.ellipse(bl * 0.05, bh * 0.15, bl * 0.35, bh * 0.25, 0, 0, Math.PI);
    ctx.fillStyle = fish.bellyColor;
    ctx.fill();

    // Scales pattern (subtle)
    if (fish.sizeIndex >= 2) {
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 0.3;
      for (let s = 0; s < 3; s++) {
        const sx = -bl * 0.15 + s * bl * 0.15;
        ctx.beginPath();
        ctx.arc(sx, -bh * 0.05, bh * 0.25, 0.5, 2.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sx, bh * 0.1, bh * 0.25, -2.6, -0.5);
        ctx.stroke();
      }
    }

    // Dorsal fin (top)
    ctx.beginPath();
    ctx.moveTo(-bl * 0.1, -bh * 0.45);
    ctx.quadraticCurveTo(bl * 0.05, -bh * 0.9, bl * 0.2, -bh * 0.4);
    ctx.fillStyle = fish.finColor;
    ctx.fill();

    // Pectoral fin (side)
    ctx.save();
    ctx.translate(bl * 0.05, bh * 0.15);
    const finWag = Math.sin(time * 0.008 + fish.swimPhase) * 0.3;
    ctx.rotate(finWag);
    ctx.beginPath();
    ctx.ellipse(0, bh * 0.2, bl * 0.15, bh * 0.18, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = fish.finColor;
    ctx.globalAlpha = (ctx.globalAlpha || 0.4) * 0.7;
    ctx.fill();
    ctx.restore();

    // Restore alpha for eye
    ctx.globalAlpha = 0.45 - depth * 0.15;

    // Eye
    const eyeR = Math.max(1, bh * 0.15);
    const eyeX = bl * 0.3;
    const eyeY = -bh * 0.12;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeX + eyeR * 0.3, eyeY, eyeR * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = fish.eyeColor;
    ctx.fill();
    // Eye highlight
    ctx.beginPath();
    ctx.arc(eyeX + eyeR * 0.1, eyeY - eyeR * 0.2, eyeR * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();

    // Mouth
    ctx.beginPath();
    ctx.arc(bl * 0.48, bh * 0.05, bh * 0.12, 0, Math.PI);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Subtle water shimmer on top of fish
    ctx.beginPath();
    ctx.ellipse(-bl * 0.1, -bh * 0.3, bl * 0.2, bh * 0.08, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(150,200,255,0.1)';
    ctx.fill();

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

    // Level 5: Cape (only behind frog, never in front)
    if (level >= 5) {
      const inAir = frog.vy !== 0;
      const wave = Math.sin(time * 0.005) * 4;
      const facing = frog.facing || 1;

      if (inAir) {
        // Flowing cape trailing behind the frog when airborne
        const capeDir = -facing;
        const baseX = capeDir * 14;
        ctx.fillStyle = 'rgba(200,30,30,0.8)';
        ctx.beginPath();
        ctx.moveTo(capeDir * 10, -6);
        ctx.lineTo(capeDir * 12, -10);
        ctx.quadraticCurveTo(baseX + capeDir * 14 + wave, -2, baseX + capeDir * 18 + wave * 1.5, 10);
        ctx.quadraticCurveTo(baseX + capeDir * 10 + wave * 0.5, 14, capeDir * 10, 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,80,80,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // When grounded: cape is hidden behind the frog body, not visible
    }

    // Level 6: Pants — colour the lower body below the bowtie blue
    if (level >= 6) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(-20, 5, 40, 14);
      ctx.clip();
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1a4a8a';
      ctx.fill();
      ctx.restore();
    }

    // Level 7: Boots — colour the feet/legs brown when jumping
    if (level >= 7) {
      const jumping = frog.vy < 0;
      const falling = frog.vy > 0;
      ctx.strokeStyle = '#8B4513';
      ctx.lineCap = 'round';
      if (jumping) {
        // Extended legs downward — thicker brown
        ctx.lineWidth = 5;
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
        // Spread legs — thicker brown
        ctx.lineWidth = 5;
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
        // Sitting — brown boots on feet tips
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.lineTo(-14, 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(14, 10);
        ctx.stroke();
      }
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

  drawGameOver(ctx, canvas, campaignMode) {
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
    if (campaignMode) {
      ctx.fillText('You ran out of hearts!', canvas.width / 2, canvas.height * 0.42);
    } else {
      ctx.fillText('You fell in the pond!', canvas.width / 2, canvas.height * 0.42);
    }

    // Retry
    ctx.font = '18px Georgia';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    if (campaignMode) {
      ctx.fillText('Press SPACE to Restart from Level 1', canvas.width / 2, canvas.height * 0.58);
    } else {
      ctx.fillText('Press SPACE to Try Again', canvas.width / 2, canvas.height * 0.58);
    }
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
