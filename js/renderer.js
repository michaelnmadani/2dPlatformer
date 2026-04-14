const Renderer = {

  // Shared function to get water bob offset at a world X position
  _getWaterBob(worldX, time) {
    return Math.sin(worldX * 0.02 + time * 0.002) * 3
         + Math.sin(worldX * 0.013 + time * 0.0015) * 2;
  },


  drawWater(ctx, canvas, time, cameraX, sceneId) {
    ctx.save();
    cameraX = cameraX || 0;
    sceneId = (sceneId !== undefined) ? sceneId : 0;

    const W = canvas.width;
    const H = canvas.height;
    const waterTop = H * 0.62;

    // --- Scene configurations ---
    const scenes = [
      {sky:[[0,'#060e1f'],[.15,'#0b1a32'],[.35,'#102545'],[.55,'#152d4f'],[.78,'#1a3858'],[1,'#1e4462']],water:[[0,'#1a4a6c'],[.25,'#153d5c'],[.5,'#0f3048'],[.75,'#0a2438'],[1,'#051520']],wr:30,wg:80,wb:150,am:1,cr:100,cg:180,cb:220},
      {sky:[[0,'#4a90d9'],[.2,'#5da0e0'],[.45,'#87CEEB'],[.7,'#a8dcf0'],[.9,'#c8e8f8'],[1,'#ddf0fc']],water:[[0,'#2878a8'],[.25,'#206898'],[.5,'#185880'],[.75,'#124868'],[1,'#0c3850']],wr:40,wg:110,wb:180,am:1,cr:120,cg:200,cb:240},
      {sky:[[0,'#1a2e1a'],[.2,'#1e3820'],[.4,'#224428'],[.6,'#2a5530'],[.8,'#305838'],[1,'#3a6840']],water:[[0,'#1a4838'],[.25,'#143a30'],[.5,'#0e2e28'],[.75,'#0a2420'],[1,'#061a18']],wr:20,wg:70,wb:60,am:.8,cr:80,cg:160,cb:120},
      {sky:[[0,'#1a1040'],[.15,'#2e1850'],[.3,'#6a2060'],[.5,'#c04830'],[.7,'#e88020'],[.85,'#f0a828'],[1,'#f8c848']],water:[[0,'#8a5020'],[.25,'#6a3818'],[.5,'#502a14'],[.75,'#3a1e10'],[1,'#28140a']],wr:120,wg:70,wb:30,am:1,cr:200,cg:150,cb:80},
      {sky:[[0,'#1a1e20'],[.2,'#222828'],[.4,'#2a3030'],[.6,'#323a38'],[.8,'#3a4240'],[1,'#424a48']],water:[[0,'#2a3a38'],[.25,'#223230'],[.5,'#1a2a28'],[.75,'#122220'],[1,'#0a1a18']],wr:30,wg:50,wb:48,am:1.5,cr:60,cg:90,cb:85},
      {sky:[[0,'#4a3868'],[.2,'#6a4878'],[.4,'#9a6888'],[.6,'#c88898'],[.8,'#e0a890'],[1,'#f0c888']],water:[[0,'#5a6888'],[.25,'#4a5878'],[.5,'#3a4868'],[.75,'#2a3858'],[1,'#1a2848']],wr:70,wg:80,wb:120,am:.7,cr:140,cg:150,cb:180},
      {sky:[[0,'#050a15'],[.2,'#060e1a'],[.4,'#081220'],[.6,'#0a1525'],[.8,'#0c182a'],[1,'#0e1b30']],water:[[0,'#0c2838'],[.25,'#0a2230'],[.5,'#081c28'],[.75,'#061620'],[1,'#041018']],wr:15,wg:60,wb:70,am:1,cr:40,cg:140,cb:100},
      {sky:[[0,'#7868a0'],[.2,'#9878b0'],[.4,'#b088b8'],[.6,'#c898c0'],[.8,'#daa8c8'],[1,'#e8b8d0']],water:[[0,'#5868a0'],[.25,'#485890'],[.5,'#384880'],[.75,'#283870'],[1,'#182860']],wr:70,wg:60,wb:120,am:.9,cr:180,cg:140,cb:200},
      {sky:[[0,'#1878c0'],[.2,'#2090d0'],[.4,'#30a8e0'],[.6,'#48c0e8'],[.8,'#68d0f0'],[1,'#88e0f8']],water:[[0,'#1898a8'],[.25,'#148898'],[.5,'#107888'],[.75,'#0c6878'],[1,'#085868']],wr:20,wg:130,wb:150,am:1,cr:80,cg:220,cb:240},
      {sky:[[0,'#0a0418'],[.15,'#120828'],[.3,'#1a0c38'],[.5,'#180a30'],[.7,'#100820'],[.85,'#0c0618'],[1,'#140a28']],water:[[0,'#1a1848'],[.25,'#141440'],[.5,'#101038'],[.75,'#0c0c30'],[1,'#080828']],wr:30,wg:20,wb:80,am:1,cr:100,cg:80,cb:200}
    ];
    const sc = scenes[sceneId] || scenes[0];

    // --- Draw background image or fallback to procedural sky ---
    const bgImg = Assets.getSceneBg(sceneId);
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, W, H);
    } else {
      // Fallback: procedural sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.65);
      for (const s of sc.sky) skyGrad.addColorStop(s[0], s[1]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H * 0.65);
    }

    // ===== SCENE-SPECIFIC SKY EFFECTS (skip if background image loaded) =====
    if (!bgImg) {

    if (sceneId === 0) {
      // --- Moonlit Night: moon, stars, fireflies ---
      const moonX = W * 0.78, moonY = H * 0.12;
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 2, moonX, moonY, 80);
      moonGlow.addColorStop(0, 'rgba(220,235,255,0.35)');
      moonGlow.addColorStop(0.15, 'rgba(180,210,240,0.18)');
      moonGlow.addColorStop(0.5, 'rgba(120,160,200,0.06)');
      moonGlow.addColorStop(1, 'rgba(60,100,160,0)');
      ctx.fillStyle = moonGlow;
      ctx.fillRect(moonX - 80, moonY - 80, 160, 160);
      ctx.beginPath(); ctx.arc(moonX, moonY, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230,240,255,0.7)'; ctx.fill();
      // Stars
      const stars0 = [[W*.12,H*.06,1.2],[W*.28,H*.04,0.8],[W*.48,H*.09,1.0],[W*.62,H*.03,0.9],[W*.88,H*.15,1.1],[W*.95,H*.07,0.7]];
      for (const s of stars0) {
        const fl = 0.35 + Math.sin(time * 0.002 + s[0] * 0.1) * 0.2;
        ctx.beginPath(); ctx.arc(s[0], s[1], s[2], 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,220,255,' + fl + ')'; ctx.fill();
      }
      // Fireflies
      for (let i = 0; i < 7; i++) {
        const fx = (W * (0.1 + i * 0.12) + Math.sin(time * 0.0008 + i * 2.5) * 40 + Math.cos(time * 0.0012 + i * 1.7) * 25) % W;
        const fy = waterTop - 40 - Math.sin(time * 0.001 + i * 3.1) * 30 - i * 8;
        const fa = 0.3 + Math.sin(time * 0.004 + i * 1.9) * 0.25;
        ctx.beginPath(); ctx.arc(fx, fy, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,230,80,' + fa + ')'; ctx.fill();
        const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, 8);
        glow.addColorStop(0, 'rgba(200,230,80,' + (fa * 0.3) + ')');
        glow.addColorStop(1, 'rgba(200,230,80,0)');
        ctx.fillStyle = glow; ctx.fillRect(fx - 8, fy - 8, 16, 16);
      }

    } else if (sceneId === 1) {
      // --- Sunny Day: sun, rays, clouds ---
      const sunX = W * 0.18, sunY = H * 0.1;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 100);
      sunGlow.addColorStop(0, 'rgba(255,250,220,0.6)');
      sunGlow.addColorStop(0.2, 'rgba(255,240,180,0.3)');
      sunGlow.addColorStop(0.5, 'rgba(255,220,120,0.1)');
      sunGlow.addColorStop(1, 'rgba(255,200,80,0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(sunX - 100, sunY - 100, 200, 200);
      ctx.beginPath(); ctx.arc(sunX, sunY, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,250,230,0.9)'; ctx.fill();
      // Sun rays
      ctx.globalAlpha = 0.06;
      for (let r = 0; r < 4; r++) {
        const angle = r * 0.8 + 0.3 + Math.sin(time * 0.0005 + r) * 0.1;
        ctx.save(); ctx.translate(sunX, sunY); ctx.rotate(angle);
        ctx.fillStyle = '#fff8e0';
        ctx.fillRect(0, -1.5, 200, 3);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      // Clouds drifting right-to-left
      for (let c = 0; c < 5; c++) {
        const cx = ((W * 1.3) - ((time * (0.008 + c * 0.003) + c * 200) % (W * 1.6))) + W * 0.15;
        const cy = H * (0.12 + c * 0.07);
        const cw = 50 + c * 15;
        const ch = 14 + c * 3;
        ctx.fillStyle = 'rgba(255,255,255,' + (0.6 - c * 0.08) + ')';
        ctx.beginPath(); ctx.ellipse(cx, cy, cw, ch, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx - cw * 0.35, cy + ch * 0.3, cw * 0.6, ch * 0.7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + cw * 0.3, cy + ch * 0.2, cw * 0.5, ch * 0.8, 0, 0, Math.PI * 2); ctx.fill();
      }

    } else if (sceneId === 2) {
      // --- Forest: trees, falling leaves, wind streaks ---
      // Mist overlay
      const mistGrad = ctx.createLinearGradient(0, H * 0.3, 0, H * 0.65);
      mistGrad.addColorStop(0, 'rgba(180,210,180,0)');
      mistGrad.addColorStop(0.6, 'rgba(180,210,180,0.08)');
      mistGrad.addColorStop(1, 'rgba(180,210,180,0.15)');
      ctx.fillStyle = mistGrad; ctx.fillRect(0, H * 0.3, W, H * 0.35);
      // Tree silhouettes (parallaxed)
      const trees = [[0.05,0.55],[0.18,0.42],[0.35,0.50],[0.55,0.38],[0.72,0.48],[0.88,0.44],[0.98,0.52]];
      for (let t = 0; t < trees.length; t++) {
        const tx = trees[t][0] * W - (cameraX * 0.05) % W;
        const th = H * trees[t][1];
        const tw = 18 + t * 3;
        const treeBot = waterTop - 5;
        // Trunk
        ctx.fillStyle = '#1a2a18';
        ctx.fillRect(tx - 3, treeBot - th * 0.4, 6, th * 0.4);
        // Canopy (layered triangles)
        ctx.fillStyle = 'rgba(20,50,20,0.85)';
        ctx.beginPath();
        ctx.moveTo(tx, treeBot - th); ctx.lineTo(tx - tw, treeBot - th * 0.3);
        ctx.lineTo(tx + tw, treeBot - th * 0.3); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(25,60,25,0.8)';
        ctx.beginPath();
        ctx.moveTo(tx, treeBot - th * 0.75); ctx.lineTo(tx - tw * 1.2, treeBot - th * 0.1);
        ctx.lineTo(tx + tw * 1.2, treeBot - th * 0.1); ctx.closePath(); ctx.fill();
      }
      // Falling leaves
      for (let l = 0; l < 10; l++) {
        const period = 5000 + l * 800;
        const phase = ((time + l * 700) % period) / period;
        const lx = (W * (0.05 + l * 0.09) + Math.sin(time * 0.001 + l * 2.3) * 30) % W;
        const ly = -10 + phase * (H + 20);
        if (ly < waterTop) {
          const rot = time * 0.003 + l * 1.5;
          const sz = 3 + (l % 3);
          ctx.save(); ctx.translate(lx, ly); ctx.rotate(rot);
          ctx.fillStyle = 'rgba(80,140,40,' + (0.5 + Math.sin(l) * 0.2) + ')';
          ctx.beginPath(); ctx.ellipse(0, 0, sz, sz * 0.4, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }
      // Wind streaks
      ctx.globalAlpha = 0.04;
      for (let w = 0; w < 5; w++) {
        const wy = H * (0.2 + w * 0.08);
        const wx = ((time * 0.15 + w * 180) % (W + 100)) - 50;
        ctx.strokeStyle = '#a0d0a0'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + 60 + w * 10, wy + Math.sin(w) * 3); ctx.stroke();
      }
      ctx.globalAlpha = 1;

    } else if (sceneId === 3) {
      // --- Golden Sunset: sun, cloud bands, birds ---
      const sunX = W * 0.5, sunY = waterTop - 8;
      // Sun disc (half below horizon)
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 120);
      sunGlow.addColorStop(0, 'rgba(255,200,80,0.5)');
      sunGlow.addColorStop(0.3, 'rgba(255,150,50,0.2)');
      sunGlow.addColorStop(0.6, 'rgba(255,100,30,0.08)');
      sunGlow.addColorStop(1, 'rgba(200,60,20,0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(sunX - 120, sunY - 120, 240, 120);
      ctx.beginPath(); ctx.arc(sunX, sunY, 25, Math.PI, 0);
      ctx.fillStyle = 'rgba(255,220,120,0.8)'; ctx.fill();
      // Warm cloud bands
      for (let b = 0; b < 4; b++) {
        const by = waterTop - 60 - b * 30 + Math.sin(time * 0.0004 + b * 2) * 5;
        const bw = W * (0.3 + b * 0.08);
        const bx = W * (0.2 + b * 0.1) + Math.sin(time * 0.0003 + b) * 20;
        ctx.fillStyle = 'rgba(200,' + (100 + b * 20) + ',' + (60 + b * 15) + ',0.15)';
        ctx.beginPath(); ctx.ellipse(bx, by, bw, 6 + b * 2, 0, 0, Math.PI * 2); ctx.fill();
      }
      // Bird silhouettes
      for (let b = 0; b < 3; b++) {
        const bx = ((time * (0.02 + b * 0.008) + b * 250) % (W + 100)) - 50;
        const by = H * (0.15 + b * 0.1) + Math.sin(time * 0.002 + b * 3) * 8;
        ctx.strokeStyle = 'rgba(40,20,10,0.4)'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx - 6, by + 3); ctx.quadraticCurveTo(bx - 2, by - 3, bx, by);
        ctx.quadraticCurveTo(bx + 2, by - 3, bx + 6, by + 3); ctx.stroke();
      }

    } else if (sceneId === 4) {
      // --- Storm: dark clouds, rain, lightning ---
      // Rolling dark clouds
      for (let c = 0; c < 4; c++) {
        const cx = W * (0.15 + c * 0.22) + Math.sin(time * 0.0003 + c * 1.8) * 40;
        const cy = H * (0.08 + c * 0.06) + Math.sin(time * 0.0005 + c * 2.3) * 10;
        ctx.fillStyle = 'rgba(25,30,28,' + (0.5 - c * 0.08) + ')';
        ctx.beginPath(); ctx.ellipse(cx, cy, 90 + c * 15, 25 + c * 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 40, cy + 10, 60 + c * 10, 20 + c * 3, 0, 0, Math.PI * 2); ctx.fill();
      }
      // Rain
      ctx.strokeStyle = 'rgba(150,170,180,0.25)'; ctx.lineWidth = 1;
      for (let r = 0; r < 40; r++) {
        const rx = (r * 23.7 + time * 0.3) % W;
        const ry = ((r * 41.3 + time * 0.8) % (waterTop + 20)) - 20;
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 3, ry + 12); ctx.stroke();
      }
      // Lightning flash (every ~180 frames, lasts 3 frames)
      const lightningCycle = Math.floor(time * 0.06) % 180;
      if (lightningCycle < 3) {
        ctx.fillStyle = 'rgba(220,230,255,' + (0.15 - lightningCycle * 0.04) + ')';
        ctx.fillRect(0, 0, W, waterTop);
      }

    } else if (sceneId === 5) {
      // --- Misty Dawn: fog layers, morning star, mist particles ---
      // Morning star
      const msA = 0.5 + Math.sin(time * 0.003) * 0.15;
      ctx.beginPath(); ctx.arc(W * 0.7, H * 0.06, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,240,200,' + msA + ')'; ctx.fill();
      const msGlow = ctx.createRadialGradient(W * 0.7, H * 0.06, 0, W * 0.7, H * 0.06, 15);
      msGlow.addColorStop(0, 'rgba(255,240,200,' + (msA * 0.3) + ')');
      msGlow.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = msGlow; ctx.fillRect(W * 0.7 - 15, H * 0.06 - 15, 30, 30);
      // Fog/mist layers
      for (let f = 0; f < 4; f++) {
        const fy = waterTop - 60 + f * 25 + Math.sin(time * 0.0003 + f * 2) * 8;
        const foff = (time * (0.005 + f * 0.002) + f * 200) % (W * 2) - W * 0.5;
        const fogGrad = ctx.createLinearGradient(foff - 100, 0, foff + W + 100, 0);
        fogGrad.addColorStop(0, 'rgba(220,200,210,0)');
        fogGrad.addColorStop(0.3, 'rgba(220,200,210,' + (0.08 + f * 0.02) + ')');
        fogGrad.addColorStop(0.7, 'rgba(230,210,220,' + (0.06 + f * 0.015) + ')');
        fogGrad.addColorStop(1, 'rgba(220,200,210,0)');
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, fy - 15, W, 30);
      }
      // Mist particles
      for (let m = 0; m < 7; m++) {
        const mx = ((time * (0.01 + m * 0.004) + m * 130) % (W + 60)) - 30;
        const my = waterTop - 30 - m * 12 + Math.sin(time * 0.001 + m * 2.8) * 10;
        ctx.beginPath(); ctx.arc(mx, my, 3 + m % 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(230,220,230,' + (0.06 + Math.sin(time * 0.002 + m) * 0.02) + ')'; ctx.fill();
      }

    } else if (sceneId === 6) {
      // --- Aurora Borealis: aurora curtains, mountains, stars ---
      // Stars behind aurora
      const stars6 = [[W*.1,H*.05],[W*.25,H*.12],[W*.4,H*.03],[W*.55,H*.14],[W*.68,H*.06],[W*.82,H*.1],[W*.92,H*.04],[W*.15,H*.18]];
      for (const s of stars6) {
        const fl = 0.3 + Math.sin(time * 0.0015 + s[0] * 0.05) * 0.15;
        ctx.beginPath(); ctx.arc(s[0], s[1], 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,220,255,' + fl + ')'; ctx.fill();
      }
      // Aurora curtains (2 bands)
      for (let a = 0; a < 2; a++) {
        const aColor = a === 0 ? [0, 255, 128] : [136, 68, 255];
        const aAlpha = a === 0 ? 0.1 : 0.07;
        const aBaseY = H * (0.1 + a * 0.12);
        const aHeight = H * (0.2 + a * 0.05);
        ctx.beginPath();
        ctx.moveTo(0, aBaseY);
        for (let x = 0; x <= W; x += 4) {
          const wave = Math.sin(x * 0.008 + time * 0.0006 + a * 2) * 20
                     + Math.sin(x * 0.015 + time * 0.001 + a * 4) * 12
                     + Math.sin(x * 0.003 + time * 0.0003) * 8;
          ctx.lineTo(x, aBaseY + wave);
        }
        for (let x = W; x >= 0; x -= 4) {
          const wave = Math.sin(x * 0.008 + time * 0.0006 + a * 2) * 20
                     + Math.sin(x * 0.015 + time * 0.001 + a * 4) * 12
                     + Math.sin(x * 0.003 + time * 0.0003) * 8;
          ctx.lineTo(x, aBaseY + aHeight + wave * 0.5);
        }
        ctx.closePath();
        const aGrad = ctx.createLinearGradient(0, aBaseY - 20, 0, aBaseY + aHeight + 20);
        aGrad.addColorStop(0, 'rgba(' + aColor[0] + ',' + aColor[1] + ',' + aColor[2] + ',0)');
        aGrad.addColorStop(0.3, 'rgba(' + aColor[0] + ',' + aColor[1] + ',' + aColor[2] + ',' + aAlpha + ')');
        aGrad.addColorStop(0.7, 'rgba(' + aColor[0] + ',' + aColor[1] + ',' + aColor[2] + ',' + (aAlpha * 0.6) + ')');
        aGrad.addColorStop(1, 'rgba(' + aColor[0] + ',' + aColor[1] + ',' + aColor[2] + ',0)');
        ctx.fillStyle = aGrad; ctx.fill();
      }
      // Mountain silhouettes
      ctx.fillStyle = '#0a0f18';
      ctx.beginPath(); ctx.moveTo(0, waterTop - 5);
      ctx.lineTo(W * 0.1, waterTop - 50); ctx.lineTo(W * 0.22, waterTop - 35);
      ctx.lineTo(W * 0.35, waterTop - 70); ctx.lineTo(W * 0.5, waterTop - 45);
      ctx.lineTo(W * 0.6, waterTop - 60); ctx.lineTo(W * 0.75, waterTop - 40);
      ctx.lineTo(W * 0.9, waterTop - 55); ctx.lineTo(W, waterTop - 30);
      ctx.lineTo(W, waterTop - 5); ctx.closePath(); ctx.fill();

    } else if (sceneId === 7) {
      // --- Cherry Blossom: trees, falling petals ---
      // Cherry tree silhouettes (2 trees on edges)
      for (let t = 0; t < 2; t++) {
        const tx = t === 0 ? W * 0.08 - cameraX * 0.03 : W * 0.92 - cameraX * 0.03;
        const tBot = waterTop - 5;
        // Trunk
        ctx.strokeStyle = '#4a2828'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(tx, tBot);
        ctx.quadraticCurveTo(tx + (t === 0 ? 8 : -8), tBot - 60, tx + (t === 0 ? 5 : -5), tBot - 100);
        ctx.stroke();
        // Branches
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(tx + (t === 0 ? 5 : -5), tBot - 70);
        ctx.quadraticCurveTo(tx + (t === 0 ? 30 : -30), tBot - 90, tx + (t === 0 ? 45 : -45), tBot - 80); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(tx + (t === 0 ? 5 : -5), tBot - 90);
        ctx.quadraticCurveTo(tx + (t === 0 ? -15 : 15), tBot - 110, tx + (t === 0 ? -25 : 25), tBot - 105); ctx.stroke();
        // Canopy blossoms
        const blobs = [[-5,-100,22],[20,-85,18],[-15,-95,16],[5,-110,20],[30,-75,15],[-20,-80,14]];
        for (const b of blobs) {
          const bx = tx + (t === 0 ? b[0] : -b[0]);
          const by = tBot + b[1] + Math.sin(time * 0.001 + b[0]) * 2;
          ctx.beginPath(); ctx.arc(bx, by, b[2], 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(180,100,130,0.25)'; ctx.fill();
          ctx.beginPath(); ctx.arc(bx + 3, by - 2, b[2] * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(200,120,140,0.2)'; ctx.fill();
        }
      }
      // Falling petals
      for (let p = 0; p < 18; p++) {
        const period = 4000 + p * 500;
        const phase = ((time + p * 350) % period) / period;
        const px = (W * (0.02 + p * 0.055) + Math.sin(time * 0.0008 + p * 1.7) * 35 + Math.cos(time * 0.0005 + p * 2.3) * 20) % W;
        const py = -10 + phase * (H + 20);
        if (py < waterTop + 10) {
          const rot = time * 0.002 + p * 1.2;
          const pa = 0.5 + Math.sin(p * 0.8) * 0.2;
          ctx.save(); ctx.translate(px, py); ctx.rotate(rot);
          ctx.fillStyle = 'rgba(230,150,170,' + pa + ')';
          ctx.beginPath(); ctx.ellipse(0, 0, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }

    } else if (sceneId === 8) {
      // --- Tropical: palms, seabirds, bright sun ---
      // Bright sun glow from above
      const tsGrad = ctx.createRadialGradient(W * 0.5, 0, 10, W * 0.5, 0, 200);
      tsGrad.addColorStop(0, 'rgba(255,255,230,0.15)');
      tsGrad.addColorStop(0.5, 'rgba(255,250,200,0.05)');
      tsGrad.addColorStop(1, 'rgba(255,240,180,0)');
      ctx.fillStyle = tsGrad; ctx.fillRect(0, 0, W, H * 0.5);
      // Palm tree silhouettes (parallaxed)
      const palms = [[0.06, 0.7],[0.22, 0.55],[0.78, 0.6],[0.94, 0.65]];
      for (let p = 0; p < palms.length; p++) {
        const px = palms[p][0] * W - (cameraX * 0.04);
        const pBot = waterTop - 5;
        const pHeight = H * palms[p][1];
        const pTop = pBot - pHeight;
        // Curved trunk
        ctx.strokeStyle = '#1a4020'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(px, pBot);
        const curve = (p % 2 === 0 ? 1 : -1) * 15;
        ctx.quadraticCurveTo(px + curve, pBot - pHeight * 0.5, px + curve * 0.5, pTop);
        ctx.stroke();
        // Palm fronds (fan of lines)
        const ftx = px + curve * 0.5, fty = pTop;
        ctx.strokeStyle = '#1a4a20'; ctx.lineWidth = 2;
        for (let f = 0; f < 7; f++) {
          const fAngle = -Math.PI * 0.8 + f * (Math.PI * 0.6 / 6) + Math.sin(time * 0.001 + p + f * 0.5) * 0.05;
          const fLen = 35 + f * 3 + Math.sin(f * 2) * 8;
          const fex = ftx + Math.cos(fAngle) * fLen;
          const fey = fty + Math.sin(fAngle) * fLen;
          ctx.beginPath(); ctx.moveTo(ftx, fty);
          ctx.quadraticCurveTo(ftx + Math.cos(fAngle) * fLen * 0.6, fty + Math.sin(fAngle) * fLen * 0.4, fex, fey);
          ctx.stroke();
        }
      }
      // Seabirds
      for (let b = 0; b < 3; b++) {
        const bx = ((time * (0.015 + b * 0.005) + b * 300) % (W + 80)) - 40;
        const by = H * (0.08 + b * 0.06) + Math.sin(time * 0.003 + b * 2) * 5;
        ctx.strokeStyle = 'rgba(20,60,40,0.35)'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx - 5, by + 2); ctx.quadraticCurveTo(bx - 1, by - 2, bx, by);
        ctx.quadraticCurveTo(bx + 1, by - 2, bx + 5, by + 2); ctx.stroke();
      }

    } else if (sceneId === 9) {
      // --- Cosmic Night: starfield, nebulae, shooting stars ---
      // Dense starfield
      for (let s = 0; s < 28; s++) {
        const sx = (s * 29.3 + Math.sin(s * 7.1) * 50) % W;
        const sy = (s * 17.7 + Math.cos(s * 4.3) * 30) % (waterTop - 10);
        const sr = 0.5 + (s % 4) * 0.4;
        const sa = 0.3 + Math.sin(time * 0.0015 + s * 1.3) * 0.2;
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220,210,255,' + sa + ')'; ctx.fill();
      }
      // Nebula clouds
      const nebulae = [
        [W * 0.25, H * 0.15, 80, [140, 60, 200, 0.06]],
        [W * 0.65, H * 0.25, 100, [60, 80, 200, 0.05]],
        [W * 0.45, H * 0.08, 60, [200, 60, 140, 0.04]]
      ];
      for (const n of nebulae) {
        const nx = n[0] + Math.sin(time * 0.0002 + n[1]) * 10;
        const ny = n[1] + Math.cos(time * 0.00015 + n[0]) * 5;
        const nGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, n[2]);
        nGrad.addColorStop(0, 'rgba(' + n[3][0] + ',' + n[3][1] + ',' + n[3][2] + ',' + n[3][3] + ')');
        nGrad.addColorStop(0.5, 'rgba(' + n[3][0] + ',' + n[3][1] + ',' + n[3][2] + ',' + (n[3][3] * 0.5) + ')');
        nGrad.addColorStop(1, 'rgba(' + n[3][0] + ',' + n[3][1] + ',' + n[3][2] + ',0)');
        ctx.fillStyle = nGrad; ctx.fillRect(nx - n[2], ny - n[2], n[2] * 2, n[2] * 2);
      }
      // Shooting stars (2 on deterministic cycles)
      for (let ss = 0; ss < 2; ss++) {
        const ssCycle = 6000 + ss * 4000;
        const ssPhase = ((time + ss * 3000) % ssCycle) / ssCycle;
        if (ssPhase < 0.08) {
          const prog = ssPhase / 0.08;
          const sx = W * (0.2 + ss * 0.5) + prog * W * 0.3;
          const sy = H * (0.05 + ss * 0.1) + prog * H * 0.15;
          const sAlpha = prog < 0.5 ? prog * 2 : (1 - prog) * 2;
          ctx.strokeStyle = 'rgba(220,210,255,' + (sAlpha * 0.6) + ')';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - 20, sy - 8); ctx.stroke();
          // Glow
          const ssGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 6);
          ssGlow.addColorStop(0, 'rgba(220,210,255,' + (sAlpha * 0.4) + ')');
          ssGlow.addColorStop(1, 'rgba(220,210,255,0)');
          ctx.fillStyle = ssGlow; ctx.fillRect(sx - 6, sy - 6, 12, 12);
        }
      }
    }
    } // end !bgImg sky effects

    // ===== WATER BODY GRADIENT =====
    if (!bgImg) {
      const waterGrad = ctx.createLinearGradient(0, waterTop, 0, H);
      for (const s of sc.water) waterGrad.addColorStop(s[0], s[1]);
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, waterTop, W, H - waterTop);
    }

    // ===== 8 WAVE LAYERS (scene-tinted, reduced when bg image present) =====
    const alphaScale = bgImg ? 0.5 : 1.0;
    const wr = sc.wr, wg = sc.wg, wb = sc.wb, am = sc.am;
    const waveConfigs = [
      { yOff: -6, aFrac: 0.22, spd: 0.0024, f1: 0.016, a1: 6, f2: 0.008, a2: 4, f3: 0.035, a3: 1.5, step: 2, rOff: 50, gOff: 80, bOff: 60 },
      { yOff: -2, aFrac: 0.20, spd: 0.0021, f1: 0.019, a1: 5.5, f2: 0.010, a2: 3.5, f3: 0.040, a3: 1.2, step: 2, rOff: 35, gOff: 65, bOff: 50 },
      { yOff: 4,  aFrac: 0.28, spd: 0.0018, f1: 0.022, a1: 5, f2: 0.011, a2: 3, f3: 0.042, a3: 1.0, step: 3, rOff: 10, gOff: 30, bOff: 20 },
      { yOff: 10, aFrac: 0.25, spd: 0.0015, f1: 0.024, a1: 4.5, f2: 0.013, a2: 2.8, f3: 0.038, a3: 0.9, step: 3, rOff: 2, gOff: 10, bOff: 0 },
      { yOff: 18, aFrac: 0.22, spd: 0.0013, f1: 0.026, a1: 4, f2: 0.014, a2: 2.5, f3: 0.033, a3: 0.8, step: 3, rOff: -6, gOff: -10, bOff: -20 },
      { yOff: 27, aFrac: 0.18, spd: 0.0011, f1: 0.028, a1: 3.5, f2: 0.015, a2: 2.2, f3: 0.030, a3: 0.7, step: 4, rOff: -12, gOff: -20, bOff: -30 },
      { yOff: 38, aFrac: 0.14, spd: 0.0009, f1: 0.030, a1: 3, f2: 0.016, a2: 1.8, f3: 0.028, a3: 0.6, step: 4, rOff: -18, gOff: -32, bOff: -40 },
      { yOff: 50, aFrac: 0.10, spd: 0.0007, f1: 0.033, a1: 2.5, f2: 0.018, a2: 1.5, f3: 0.025, a3: 0.5, step: 4, rOff: -22, gOff: -45, bOff: -55 }
    ];

    for (const wl of waveConfigs) {
      const y0 = waterTop + wl.yOff;
      ctx.beginPath();
      ctx.moveTo(0, y0);
      for (let x = 0; x <= W; x += wl.step) {
        const wx = x + cameraX;
        const sy = y0
          + (Math.sin(wx * wl.f1 + time * wl.spd) * wl.a1
          + Math.sin(wx * wl.f2 + time * wl.spd * 0.7 + 1.5) * wl.a2
          + Math.sin(wx * wl.f3 + time * wl.spd * 0.4 + 3.7) * wl.a3) * am;
        ctx.lineTo(x, sy);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      const cr = Math.max(0, Math.min(255, wr + wl.rOff));
      const cg = Math.max(0, Math.min(255, wg + wl.gOff));
      const cb = Math.max(0, Math.min(255, wb + wl.bOff));
      ctx.fillStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + (wl.aFrac * alphaScale) + ')';
      ctx.fill();
    }

    // ===== SPECULAR HIGHLIGHTS (skip for storm) =====
    if (sceneId !== 4 && sceneId !== 5) {
      for (let i = 0; i < 18; i++) {
        const seedX = (i * 137.5 + time * 0.015) % W;
        const wx = seedX + cameraX;
        const wc = waveConfigs[0];
        const y0 = waterTop + wc.yOff;
        const crestY = y0 + (Math.sin(wx * wc.f1 + time * wc.spd) * wc.a1
          + Math.sin(wx * wc.f2 + time * wc.spd * 0.7 + 1.5) * wc.a2
          + Math.sin(wx * wc.f3 + time * wc.spd * 0.4 + 3.7) * wc.a3) * am;
        const dx = 0.5;
        const wxN = wx + dx;
        const nextY = y0 + (Math.sin(wxN * wc.f1 + time * wc.spd) * wc.a1
          + Math.sin(wxN * wc.f2 + time * wc.spd * 0.7 + 1.5) * wc.a2
          + Math.sin(wxN * wc.f3 + time * wc.spd * 0.4 + 3.7) * wc.a3) * am;
        if (Math.abs(nextY - crestY) < 0.15) {
          const br = 0.2 + Math.sin(time * 0.003 + i * 0.8) * 0.08;
          const rad = 1.5 + Math.sin(time * 0.002 + i * 1.3) * 0.6;
          // Tint specular based on scene
          const spR = sceneId === 3 ? 255 : 200;
          const spG = sceneId === 3 ? 220 : 240;
          const spB = sceneId === 3 ? 160 : 255;
          ctx.beginPath(); ctx.arc(seedX, crestY, rad, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + spR + ',' + spG + ',' + spB + ',' + br + ')'; ctx.fill();
        }
      }
    }

    // ===== SCENE-SPECIFIC WATER EFFECTS =====
    // Sunset sun pillar reflection
    if (sceneId === 3) {
      const pillarGrad = ctx.createLinearGradient(0, waterTop, 0, waterTop + 80);
      pillarGrad.addColorStop(0, 'rgba(255,180,80,0.15)');
      pillarGrad.addColorStop(0.5, 'rgba(255,150,60,0.08)');
      pillarGrad.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = pillarGrad;
      ctx.fillRect(W * 0.45, waterTop, W * 0.1, 80);
    }
    // Aurora reflection on water
    if (sceneId === 6) {
      for (let ar = 0; ar < 2; ar++) {
        const arColor = ar === 0 ? '0,180,100' : '100,60,200';
        const arAlpha = 0.04 + Math.sin(time * 0.001 + ar * 3) * 0.02;
        const arY = waterTop + 5 + ar * 15;
        ctx.fillStyle = 'rgba(' + arColor + ',' + arAlpha + ')';
        ctx.fillRect(0, arY, W, 12);
      }
    }
    // Cosmic water sparkles
    if (sceneId === 9) {
      for (let sp = 0; sp < 10; sp++) {
        const spx = (sp * 83.3 + time * 0.02) % W;
        const spy = waterTop + 10 + (sp * 31.7) % 60;
        const spA = 0.15 + Math.sin(time * 0.004 + sp * 2.1) * 0.1;
        if (spA > 0.1) {
          ctx.beginPath(); ctx.arc(spx, spy, 1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(200,180,255,' + spA + ')'; ctx.fill();
        }
      }
    }
    // Moon reflection (night scene)
    if (sceneId === 0) {
      const mrX = W * 0.78 + Math.sin(time * 0.001) * 8;
      const mrGrad = ctx.createRadialGradient(mrX, waterTop + 12, 1, mrX, waterTop + 12, 40);
      mrGrad.addColorStop(0, 'rgba(200,220,240,0.1)');
      mrGrad.addColorStop(0.4, 'rgba(150,180,210,0.04)');
      mrGrad.addColorStop(1, 'rgba(100,140,180,0)');
      ctx.fillStyle = mrGrad; ctx.fillRect(mrX - 40, waterTop, 80, 30);
    }
    // Sun reflection (sunny day)
    if (sceneId === 1) {
      const srX = W * 0.18 + Math.sin(time * 0.0008) * 10;
      const srGrad = ctx.createRadialGradient(srX, waterTop + 10, 2, srX, waterTop + 10, 50);
      srGrad.addColorStop(0, 'rgba(255,240,200,0.12)');
      srGrad.addColorStop(0.5, 'rgba(255,220,160,0.05)');
      srGrad.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = srGrad; ctx.fillRect(srX - 50, waterTop, 100, 30);
    }
    // Dappled forest light
    if (sceneId === 2) {
      for (let d = 0; d < 8; d++) {
        const dx = (d * 107 + Math.sin(time * 0.0005 + d * 2.4) * 30 + cameraX * 0.3) % W;
        const dy = waterTop + 8 + d * 5 + Math.sin(time * 0.001 + d) * 4;
        const da = 0.06 + Math.sin(time * 0.002 + d * 1.5) * 0.03;
        ctx.beginPath(); ctx.ellipse(dx, dy, 12, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(140,200,100,' + da + ')'; ctx.fill();
      }
    }
    // Cherry petal reflections on water
    if (sceneId === 7) {
      for (let pr = 0; pr < 8; pr++) {
        const prx = (pr * 97 + time * 0.01) % W;
        const pry = waterTop + 5 + (pr * 11) % 20;
        const pra = 0.08 + Math.sin(time * 0.002 + pr * 1.8) * 0.04;
        ctx.beginPath(); ctx.ellipse(prx, pry, 4, 1.5, Math.sin(time * 0.001 + pr) * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220,150,170,' + pra + ')'; ctx.fill();
      }
    }

    // ===== UNDERWATER CAUSTICS =====
    const waterDepth = H - waterTop;
    const causticCount = sceneId === 4 ? 16 : 30;
    for (let i = 0; i < causticCount; i++) {
      const row = Math.floor(i / 6);
      const col = i % 6;
      const baseX = (col + 0.5) * (W / 6);
      const baseY = waterTop + 15 + row * (waterDepth * 0.16);
      const t1 = time * 0.0008 + i * 1.7;
      const t2 = time * 0.0006 + i * 2.3;
      const cx = baseX + Math.sin(t1 * 0.7 + col * 2.1) * 18 + Math.sin(t2 * 1.1) * 10;
      const cy = baseY + Math.sin(t1 * 0.5 + row * 1.8) * 8 + Math.cos(t2 * 0.8 + col) * 6;
      const depthFrac = (cy - waterTop) / waterDepth;
      const causticAlpha = Math.max(0, (0.12 - depthFrac * 0.1)) * (0.6 + Math.sin(t1 * 1.5) * 0.4);
      if (causticAlpha > 0.01) {
        const sz = 8 + Math.sin(t1 * 0.9 + i) * 5;
        const szY = 3 + Math.sin(t2 * 0.7) * 2;
        ctx.beginPath(); ctx.ellipse(cx, cy, sz, szY, Math.sin(t1 * 0.3 + i * 0.5) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + sc.cr + ',' + sc.cg + ',' + sc.cb + ',' + causticAlpha + ')';
        ctx.fill();
      }
    }

    // ===== BUBBLES =====
    for (let i = 0; i < 6; i++) {
      const seed = i * 73.17;
      const period = 4000 + i * 1100;
      const phase = ((time + seed * 300) % period) / period;
      const bx = (W * (0.1 + i * 0.15) + Math.sin(seed + time * 0.0003) * 30) % W;
      const by = H - phase * (H - waterTop - 5);
      if (by > waterTop + 5) {
        const radius = 1 + (i % 3);
        const bAlpha = 0.12 + Math.sin(time * 0.003 + seed) * 0.04;
        ctx.beginPath(); ctx.arc(bx, by, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(170,215,240,' + bAlpha + ')'; ctx.fill();
        ctx.beginPath(); ctx.arc(bx - radius * 0.3, by - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220,240,255,' + (bAlpha * 0.7) + ')'; ctx.fill();
      }
    }

    // ===== DEPTH GRADIENT =====
    const depthGrad = ctx.createLinearGradient(0, H - 60, 0, H);
    depthGrad.addColorStop(0, 'rgba(4,12,30,0)');
    depthGrad.addColorStop(1, 'rgba(4,12,30,0.7)');
    ctx.fillStyle = depthGrad;
    ctx.fillRect(0, H - 60, W, 60);

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

    const jumping = frog.vy < 0;
    const falling = frog.vy > 0;

    // Try sprite-based rendering
    // Frames: 0=idle, 1=crouch, 2=jump, 3=fall
    let frameIndex = 0;
    if (jumping) frameIndex = 2;
    else if (falling) frameIndex = 3;
    else if (Math.abs(frog.vx || 0) > 0.5) frameIndex = 1;

    const frame = Assets.getSpriteFrame('frog-sprites', frameIndex, 4);
    if (frame) {
      const drawH = 110;
      const drawW = drawH * (frame.sw / frame.sh);
      // Align so frog feet (~70% down in sprite) sit at hitbox bottom (frog.y + height)
      const footY = frog.y + frog.height;
      const drawY = footY - drawH * 0.70;
      const drawX = frog.x - drawW / 2;
      ctx.save();
      if (frog.facing === -1) {
        ctx.translate(frog.x, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(frame.img, frame.sx, frame.sy, frame.sw, frame.sh,
          -drawW / 2, drawY, drawW, drawH);
      } else {
        ctx.drawImage(frame.img, frame.sx, frame.sy, frame.sw, frame.sh,
          drawX, drawY, drawW, drawH);
      }
      ctx.restore();
      ctx.restore();
      return;
    }

    // Fallback: procedural frog
    ctx.translate(frog.x, frog.y);
    if (frog.facing === -1) {
      ctx.scale(-1, 1);
    }

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
    const bob = Math.sin(time * 0.003) * 2;
    const tp = prince.transformProgress || 0;

    // Try sprite-based rendering
    const sheetKey = tp > 0 ? 'prince-transform' : 'prince-idle';
    let frameIndex;
    if (tp > 0) {
      // Transform: pick frame based on transform progress (0→1 maps to frames 0→3)
      frameIndex = Math.min(3, Math.floor(tp * 4));
    } else {
      // Idle: cycle through 4 frames
      frameIndex = Math.floor((time * 0.003) % 4);
    }
    const frame = Assets.getSpriteFrame(sheetKey, frameIndex, 4);

    if (frame) {
      // Draw sprite centered on prince position
      const drawH = 70;
      const drawW = drawH * (frame.sw / frame.sh);
      ctx.drawImage(
        frame.img,
        frame.sx, frame.sy, frame.sw, frame.sh,
        prince.x - drawW / 2, prince.y - drawH + 20 + bob, drawW, drawH
      );
    } else {
      // Fallback: procedural prince
      ctx.translate(prince.x, prince.y);
      ctx.translate(0, bob);
      const bodyHeight = 30 * (1 - tp * 0.5);
      const bodyWidth = 16 * (1 + tp * 0.3);
      const headRadius = 10 * (1 - tp * 0.2);
      const greenMix = tp;
      const skinR = Math.round(255 * (1 - greenMix) + 51 * greenMix);
      const skinG = Math.round(218 * (1 - greenMix) + 170 * greenMix);
      const skinB = Math.round(185 * (1 - greenMix) + 34 * greenMix);
      const skinColor = 'rgb(' + skinR + ',' + skinG + ',' + skinB + ')';
      const robeR = Math.round(40 * (1 - greenMix) + 45 * greenMix);
      const robeG = Math.round(60 * (1 - greenMix) + 130 * greenMix);
      const robeB = Math.round(150 * (1 - greenMix) + 40 * greenMix);
      const robeColor = 'rgb(' + robeR + ',' + robeG + ',' + robeB + ')';
      ctx.fillStyle = robeColor;
      ctx.fillRect(-bodyWidth / 2, -5, bodyWidth, bodyHeight);
      ctx.strokeStyle = robeColor; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-bodyWidth/2, 2); ctx.lineTo(-bodyWidth/2-8, 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bodyWidth/2, 2); ctx.lineTo(bodyWidth/2+8, 14); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -10, headRadius, 0, Math.PI * 2);
      ctx.fillStyle = skinColor; ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(-3, -12, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(3, -12, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'black';
      ctx.beginPath(); ctx.arc(-2.5, -12, 1.2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(3.5, -12, 1.2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -8, 3, 0.2, Math.PI-0.2);
      ctx.strokeStyle = '#884422'; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(-7,-18); ctx.lineTo(-7,-24); ctx.lineTo(-3,-20);
      ctx.lineTo(0,-26); ctx.lineTo(3,-20); ctx.lineTo(7,-24); ctx.lineTo(7,-18);
      ctx.closePath(); ctx.fill();
    }

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
      const heartImg = Assets.get('particle-heart');
      const s = (p.size || 5) * 2.5;
      if (heartImg) {
        ctx.drawImage(heartImg, p.x - s / 2, p.y - s / 2, s, s);
      } else {
        ctx.fillStyle = 'red';
        const hs = p.size || 5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + hs * 0.3);
        ctx.bezierCurveTo(p.x, p.y - hs * 0.3, p.x - hs, p.y - hs * 0.3, p.x - hs, p.y + hs * 0.2);
        ctx.bezierCurveTo(p.x - hs, p.y + hs * 0.7, p.x, p.y + hs, p.x, p.y + hs * 1.2);
        ctx.bezierCurveTo(p.x, p.y + hs, p.x + hs, p.y + hs * 0.7, p.x + hs, p.y + hs * 0.2);
        ctx.bezierCurveTo(p.x + hs, p.y - hs * 0.3, p.x, p.y - hs * 0.3, p.x, p.y + hs * 0.3);
        ctx.closePath(); ctx.fill();
      }
    } else if (p.type === 'splash') {
      ctx.fillStyle = 'rgba(100,180,255,0.8)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'sparkle') {
      const sparkleImg = Assets.get('particle-sparkle');
      const s = (p.size || 4) * 2.5;
      if (sparkleImg) {
        ctx.drawImage(sparkleImg, p.x - s / 2, p.y - s / 2, s, s);
      } else {
        ctx.fillStyle = '#ffdd44';
        const ss = p.size || 4;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - ss); ctx.lineTo(p.x + ss * 0.3, p.y - ss * 0.3);
        ctx.lineTo(p.x + ss, p.y); ctx.lineTo(p.x + ss * 0.3, p.y + ss * 0.3);
        ctx.lineTo(p.x, p.y + ss); ctx.lineTo(p.x - ss * 0.3, p.y + ss * 0.3);
        ctx.lineTo(p.x - ss, p.y); ctx.lineTo(p.x - ss * 0.3, p.y - ss * 0.3);
        ctx.closePath(); ctx.fill();
      }
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
    const heartImg = Assets.get('particle-heart');
    for (let i = 0; i < lives; i++) {
      const hx = canvas.width - 30 - i * 28;
      const hy = 12;
      if (heartImg) {
        ctx.drawImage(heartImg, hx - 10, hy, 20, 20);
      } else {
        ctx.fillStyle = '#ee3344';
        ctx.beginPath();
        ctx.moveTo(hx, hy + 11);
        ctx.bezierCurveTo(hx, hy + 6, hx - 7, hy + 6, hx - 7, hy + 10);
        ctx.bezierCurveTo(hx - 7, hy + 15, hx, hy + 19, hx, hy + 21);
        ctx.bezierCurveTo(hx, hy + 19, hx + 7, hy + 15, hx + 7, hy + 10);
        ctx.bezierCurveTo(hx + 7, hy + 6, hx, hy + 6, hx, hy + 11);
        ctx.closePath(); ctx.fill();
      }
    }

    ctx.restore();
  },

  drawTitleScreen(ctx, canvas, time) {
    ctx.save();
    const W = canvas.width, H = canvas.height;

    // Background: use moonlit night image or gradient fallback
    const bgImg = Assets.get('bg-moonlit-night');
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, W, H);
      // Dark overlay for readability
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, 0, W, H);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0a1a3c');
      grad.addColorStop(1, '#1a3a5c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // Animated sparkle particles
    for (let i = 0; i < 15; i++) {
      const sx = (i * 57.3 + time * 0.01) % W;
      const sy = (i * 37.7 + Math.sin(time * 0.001 + i * 2.1) * 30) % (H * 0.6);
      const sa = 0.2 + Math.sin(time * 0.003 + i * 1.5) * 0.15;
      const sparkleImg = Assets.get('particle-sparkle');
      if (sparkleImg) {
        ctx.globalAlpha = sa;
        ctx.drawImage(sparkleImg, sx - 6, sy - 6, 12, 12);
        ctx.globalAlpha = 1;
      } else {
        ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,240,180,' + sa + ')'; ctx.fill();
      }
    }

    // Title logo image or text fallback
    const logoImg = Assets.get('title-logo');
    if (logoImg) {
      const logoW = 400;
      const logoH = logoW * (logoImg.height / logoImg.width);
      const logoX = (W - logoW) / 2;
      const logoY = H * 0.06;
      // Glow effect
      ctx.shadowColor = 'rgba(50,170,30,0.5)';
      ctx.shadowBlur = 25;
      ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
      ctx.shadowBlur = 0;
    } else {
      ctx.textAlign = 'center';
      ctx.font = 'bold 48px Georgia';
      ctx.shadowColor = 'rgba(50,170,30,0.6)';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#44aa22';
      ctx.fillText('FROG PRINCE', W / 2, H * 0.25);
      ctx.shadowBlur = 0;
    }

    // Subtitle
    ctx.textAlign = 'center';
    ctx.font = '18px Georgia';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('A Fairy Tale Platformer', W / 2, H * 0.42);

    // Frog sprite on lilypad
    const frogFrame = Assets.getSpriteFrame('frog-sprites', 0, 4);
    const frogY = H * 0.68;
    const frogX = W / 2;
    // Lilypad
    ctx.beginPath();
    ctx.ellipse(frogX, frogY + 10, 35, 10, 0, 0.3, Math.PI * 2 - 0.3);
    ctx.lineTo(frogX, frogY + 10);
    ctx.closePath();
    ctx.fillStyle = '#2d8a4e';
    ctx.fill();
    // Frog
    if (frogFrame) {
      const fh = 35;
      const fw = fh * (frogFrame.sw / frogFrame.sh);
      ctx.drawImage(frogFrame.img, frogFrame.sx, frogFrame.sy, frogFrame.sw, frogFrame.sh,
        frogX - fw / 2, frogY - fh / 2 - 5, fw, fh);
    } else {
      ctx.beginPath(); ctx.ellipse(frogX, frogY, 14, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#33aa22'; ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(frogX - 5, frogY - 8, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(frogX + 5, frogY - 8, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'black';
      ctx.beginPath(); ctx.arc(frogX - 4, frogY - 8, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(frogX + 6, frogY - 8, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    // Prince sprite on right side
    const princeFrame = Assets.getSpriteFrame('prince-idle', Math.floor((time * 0.003) % 4), 4);
    if (princeFrame) {
      const ph = 55;
      const pw = ph * (princeFrame.sw / princeFrame.sh);
      ctx.globalAlpha = 0.7;
      ctx.drawImage(princeFrame.img, princeFrame.sx, princeFrame.sy, princeFrame.sw, princeFrame.sh,
        W * 0.78 - pw / 2, frogY - ph + 15, pw, ph);
      ctx.globalAlpha = 1;
    }

    // Blinking start text
    const alpha = (Math.sin(time * 0.003) + 1) / 2;
    ctx.globalAlpha = 0.3 + alpha * 0.7;
    ctx.font = '20px Georgia';
    ctx.fillStyle = 'white';
    ctx.fillText('Press SPACE or Click to Start', W / 2, H * 0.88);
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
