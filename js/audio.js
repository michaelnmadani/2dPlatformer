// Audio system using Web Audio API - all sounds generated programmatically
const Audio = (() => {
    let ctx = null;

    function getCtx() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return ctx;
    }

    function playTone(freq, duration, type = 'sine', volume = 0.3, ramp = true) {
        try {
            const c = getCtx();
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, c.currentTime);
            gain.gain.setValueAtTime(volume, c.currentTime);
            if (ramp) {
                gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + duration);
            }
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(c.currentTime);
            osc.stop(c.currentTime + duration);
        } catch (e) {}
    }

    function playNoise(duration, volume = 0.2) {
        try {
            const c = getCtx();
            const bufferSize = c.sampleRate * duration;
            const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / bufferSize);
            }
            const source = c.createBufferSource();
            source.buffer = buffer;
            const gain = c.createGain();
            gain.gain.setValueAtTime(volume, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + duration);
            const filter = c.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, c.currentTime);
            source.connect(filter);
            filter.connect(gain);
            gain.connect(c.destination);
            source.start();
        } catch (e) {}
    }

    return {
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
        unlock() {
            playTone(440, 0.15, 'sine', 0.15);
            setTimeout(() => playTone(660, 0.2, 'sine', 0.2), 100);
        }
    };
})();
