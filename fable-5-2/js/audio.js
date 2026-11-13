// Audio system using Web Audio API - every sound is generated in code:
// effects, music, and scene ambience (birdsong, rain, wind).
// The music is an arrangement of Brahms' Lullaby (Wiegenlied, Op. 49
// No. 4, 1868 — public domain), transposed and paced per scene.
const Audio = (() => {
    let ctx = null;
    let master = null;      // everything routes through here (mute)
    let musicBus = null;    // melody + ambience
    let unlocked = false;   // set on the first user gesture
    let muted = false;
    let wantScene = null;   // scene the game asked for
    let playing = null;     // scene currently sounding
    let timer = null;
    let nextStep = 0;
    let step = 0;
    let nextAmb = 0;
    let ambNodes = [];

    try { muted = localStorage.getItem('frogPrinceFable52_muted') === '1'; } catch (e) {}

    // Brahms' Lullaby as [semitones above the tonic, length in eighth
    // notes]: a two-note pickup, then sixteen bars of 3/4
    const MELODY = [
        [4, 1], [4, 1],
        [7, 3], [4, 1], [4, 2],
        [7, 4], [4, 1], [7, 1],
        [12, 2], [11, 3], [9, 1],
        [9, 2], [7, 2], [2, 1], [4, 1],
        [5, 2], [2, 2], [2, 1], [4, 1],
        [5, 4], [2, 1], [5, 1],
        [11, 1], [9, 1], [7, 2], [11, 2],
        [12, 4], [0, 1], [0, 1],
        [12, 4], [9, 1], [5, 1],
        [7, 4], [4, 1], [0, 1],
        [5, 2], [7, 2], [9, 2],
        [7, 4], [0, 1], [0, 1],
        [12, 4], [9, 1], [5, 1],
        [7, 4], [4, 1], [0, 1],
        [5, 2], [4, 2], [2, 2],
        [0, 4]
    ];
    // One chord per bar (root as semitones above the tonic), with the
    // bass note and the soft dyad played on beats two and three
    const CHORDS = [0, 0, 0, 7, 7, 7, 7, 0, 5, 0, 7, 0, 5, 0, 7, 0];
    const BASS = { 0: 0, 7: -5, 5: -7 };
    const DYAD = { 0: [4, 7], 7: [11, 14], 5: [9, 12] };

    // Lay the melody out on an eighth-note grid
    const STEPS = [];
    for (const note of MELODY) {
        STEPS.push(note);
        for (let i = 1; i < note[1]; i++) STEPS.push(null);
    }
    const LOOP = STEPS.length; // 96 eighths; the pickup closes bar 16

    // root = MIDI note of the tonic, bpm, lead wave, ambience
    const SCENES = [
        { root: 57, bpm: 76,  wave: 'triangle', amb: null },    // Moonlit Pond
        { root: 60, bpm: 104, wave: 'triangle', amb: 'birds' }, // Sunny Meadow
        { root: 62, bpm: 92,  wave: 'triangle', amb: 'birds' }, // Whispering Forest
        { root: 65, bpm: 84,  wave: 'sine',     amb: null },    // Golden Sunset
        { root: 64, bpm: 96,  wave: 'triangle', amb: 'rain' },  // Stormy Marsh
        { root: 55, bpm: 72,  wave: 'sine',     amb: 'wind' },  // Misty Dawn
        { root: 59, bpm: 70,  wave: 'sine',     amb: 'wind' },  // Aurora Lake
        { root: 57, bpm: 88,  wave: 'triangle', amb: 'birds' }, // Cherry Blossom Brook
        { root: 60, bpm: 116, wave: 'triangle', amb: 'birds' }, // Tropical Lagoon
        { root: 61, bpm: 80,  wave: 'sine',     amb: 'wind' }   // Cosmic Night
    ];

    function getCtx() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            master = ctx.createGain();
            master.gain.value = muted ? 0 : 1;
            master.connect(ctx.destination);
            musicBus = ctx.createGain();
            musicBus.gain.value = 0.55;
            musicBus.connect(master);
        }
        if (ctx.state === 'suspended' && unlocked) {
            ctx.resume();
        }
        return ctx;
    }

    function playTone(freq, duration, type = 'sine', volume = 0.3, when = 0, bus) {
        if (!unlocked) return;
        try {
            const c = getCtx();
            const t = Math.max(c.currentTime, when);
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(volume, t);
            gain.gain.exponentialRampToValueAtTime(0.0008, t + duration);
            osc.connect(gain);
            gain.connect(bus || master);
            osc.start(t);
            osc.stop(t + duration + 0.02);
        } catch (e) {}
    }

    function noiseBuffer(c, seconds) {
        const size = Math.floor(c.sampleRate * seconds);
        const buffer = c.createBuffer(1, size, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
        return buffer;
    }

    function playNoise(duration, volume = 0.2) {
        if (!unlocked) return;
        try {
            const c = getCtx();
            const source = c.createBufferSource();
            source.buffer = noiseBuffer(c, duration);
            const gain = c.createGain();
            gain.gain.setValueAtTime(volume, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
            const filter = c.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, c.currentTime);
            source.connect(filter);
            filter.connect(gain);
            gain.connect(master);
            source.start();
        } catch (e) {}
    }

    const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

    // ---- Ambience ----

    function startAmbience(kind) {
        const c = getCtx();
        if (kind !== 'rain' && kind !== 'wind') return;
        const src = c.createBufferSource();
        src.buffer = noiseBuffer(c, 2);
        src.loop = true;
        const filter = c.createBiquadFilter();
        const gain = c.createGain();
        if (kind === 'rain') {
            filter.type = 'bandpass';
            filter.frequency.value = 1800;
            filter.Q.value = 0.5;
            gain.gain.value = 0.11;
        } else {
            filter.type = 'lowpass';
            filter.frequency.value = 380;
            gain.gain.value = 0.09;
            // Slow swell
            const lfo = c.createOscillator();
            const depth = c.createGain();
            lfo.frequency.value = 0.13;
            depth.gain.value = 0.05;
            lfo.connect(depth);
            depth.connect(gain.gain);
            lfo.start();
            ambNodes.push(lfo);
        }
        src.connect(filter);
        filter.connect(gain);
        gain.connect(musicBus);
        src.start();
        ambNodes.push(src, gain);
    }

    function stopAmbience() {
        for (const n of ambNodes) {
            try { if (n.stop) n.stop(); } catch (e) {}
            try { n.disconnect(); } catch (e) {}
        }
        ambNodes = [];
    }

    function birdsong(t) {
        const c = getCtx();
        const base = 2100 + Math.random() * 900;
        for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
            const osc = c.createOscillator();
            const gain = c.createGain();
            const s = t + i * 0.16;
            osc.frequency.setValueAtTime(base, s);
            osc.frequency.exponentialRampToValueAtTime(base * 1.45, s + 0.09);
            gain.gain.setValueAtTime(0.022, s);
            gain.gain.exponentialRampToValueAtTime(0.0008, s + 0.11);
            osc.connect(gain);
            gain.connect(musicBus);
            osc.start(s);
            osc.stop(s + 0.13);
        }
    }

    // ---- Music scheduler ----

    function schedule() {
        if (playing === null || !ctx) return;
        const sc = SCENES[playing];
        const stepDur = 60 / sc.bpm / 2;
        if (nextStep < ctx.currentTime) nextStep = ctx.currentTime + 0.05;
        while (nextStep < ctx.currentTime + 0.35) {
            const i = step % LOOP;
            // Every other time through, the tune moves up an octave on a
            // softer voice, so the piece runs twice as long before repeating
            const second = Math.floor(step / LOOP) % 2 === 1;
            const note = STEPS[i];
            if (note) {
                playTone(hz(sc.root + note[0] + (second ? 12 : 0)), stepDur * note[1] + 0.4,
                    second ? 'sine' : sc.wave, second ? 0.06 : 0.075, nextStep, musicBus);
            }
            // Waltz accompaniment: bass on beat one, dyad on beats two and three
            const inBar = i - 2;
            if (inBar >= 0 && inBar % 2 === 0) {
                const chord = CHORDS[Math.floor(inBar / 6)];
                if (inBar % 6 === 0) {
                    playTone(hz(sc.root - 12 + BASS[chord]), stepDur * 5, 'sine', 0.08, nextStep, musicBus);
                } else {
                    for (const d of DYAD[chord]) {
                        playTone(hz(sc.root - 12 + d), stepDur * 1.8, 'sine', 0.028, nextStep, musicBus);
                    }
                }
            }
            nextStep += stepDur;
            step++;
        }
        if (sc.amb === 'birds' && ctx.currentTime >= nextAmb) {
            birdsong(ctx.currentTime + 0.05);
            nextAmb = ctx.currentTime + 2 + Math.random() * 3.5;
        }
    }

    function syncMusic() {
        if (!unlocked || wantScene === playing) return;
        try {
            getCtx();
            stopAmbience();
            if (timer) { clearInterval(timer); timer = null; }
            playing = wantScene;
            if (playing === null) return;
            step = 0;
            nextStep = ctx.currentTime + 0.25;
            nextAmb = ctx.currentTime + 1;
            startAmbience(SCENES[playing].amb);
            timer = setInterval(schedule, 100);
        } catch (e) {}
    }

    return {
        // Call from any user gesture: browsers block audio until then
        unlock() {
            if (unlocked) return;
            unlocked = true;
            try { getCtx(); } catch (e) {}
            syncMusic();
        },
        // Scene index 0-9 for its music + ambience, or null for silence
        setScene(sceneId) {
            wantScene = (sceneId === null || sceneId === undefined) ? null : sceneId;
            syncMusic();
        },
        isMuted() { return muted; },
        toggleMute() {
            muted = !muted;
            try { localStorage.setItem('frogPrinceFable52_muted', muted ? '1' : '0'); } catch (e) {}
            if (master) master.gain.value = muted ? 0 : 1;
            return muted;
        },

        jump() {
            playTone(300, 0.15, 'sine', 0.2);
            setTimeout(() => playTone(500, 0.1, 'sine', 0.15), 50);
        },
        land() {
            playTone(150, 0.1, 'triangle', 0.1);
        },
        splash() {
            playNoise(0.5, 0.3);
            playTone(200, 0.3, 'sine', 0.1);
        },
        kiss() {
            playTone(523, 0.2, 'sine', 0.2);
            setTimeout(() => playTone(659, 0.2, 'sine', 0.2), 150);
            setTimeout(() => playTone(784, 0.3, 'sine', 0.25), 300);
        },
        levelComplete() {
            const notes = [523, 587, 659, 784, 1047];
            notes.forEach((n, i) => {
                setTimeout(() => playTone(n, 0.3, 'sine', 0.2), i * 120);
            });
        },
        death() {
            playTone(400, 0.15, 'sawtooth', 0.15);
            setTimeout(() => playTone(300, 0.15, 'sawtooth', 0.15), 100);
            setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.1), 200);
        },
        click() {
            playTone(800, 0.05, 'sine', 0.1);
        },
        unlockLevel() {
            playTone(440, 0.15, 'sine', 0.15);
            setTimeout(() => playTone(660, 0.2, 'sine', 0.2), 100);
        },
        collect() {
            playTone(1320, 0.09, 'sine', 0.14);
            setTimeout(() => playTone(1760, 0.14, 'sine', 0.12), 60);
        },
        checkpoint() {
            playTone(660, 0.14, 'triangle', 0.16);
            setTimeout(() => playTone(880, 0.14, 'triangle', 0.16), 110);
            setTimeout(() => playTone(1320, 0.25, 'triangle', 0.14), 220);
        }
    };
})();
