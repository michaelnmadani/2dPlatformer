const Assets = {
  images: {},
  loaded: false,
  total: 0,
  count: 0,

  // Background image keys mapped to scene IDs
  SCENE_BGS: [
    'bg-moonlit-night',   // scene 0
    'bg-sunny-day',       // scene 1
    'bg-forest',          // scene 2
    'bg-golden-sunset',   // scene 3
    'bg-storm',           // scene 4
    'bg-misty-dawn',      // scene 5
    'bg-aurora',          // scene 6
    'bg-cherry-blossom',  // scene 7
    'bg-tropical',        // scene 8
    'bg-cosmic-night'     // scene 9
  ],

  load(callback) {
    const manifest = {
      // Backgrounds (JPG)
      'bg-moonlit-night':  'assets/bg-moonlit-night.jpg',
      'bg-sunny-day':      'assets/bg-sunny-day.jpg',
      'bg-forest':         'assets/bg-forest.jpg',
      'bg-golden-sunset':  'assets/bg-golden-sunset.jpg',
      'bg-storm':          'assets/bg-storm.jpg',
      'bg-misty-dawn':     'assets/bg-misty-dawn.jpg',
      'bg-aurora':         'assets/bg-aurora.jpg',
      'bg-cherry-blossom': 'assets/bg-cherry-blossom.jpg',
      'bg-tropical':       'assets/bg-tropical.jpg',
      'bg-cosmic-night':   'assets/bg-cosmic-night.jpg',
      // Character sprites (PNG with transparency)
      'prince-idle':       'assets/prince-idle.png',
      'prince-transform':  'assets/prince-transform.png',
      'frog-sprites':      'assets/frog-sprites.png',
      // Particles
      'particle-heart':    'assets/particle-heart.png',
      'particle-sparkle':  'assets/particle-sparkle.png',
      // Title
      'title-logo':        'assets/title-logo.png'
    };

    this.total = Object.keys(manifest).length;
    this.count = 0;

    for (const [key, src] of Object.entries(manifest)) {
      const img = new Image();
      img.onload = () => {
        this.images[key] = img;
        this.count++;
        this._updateBar();
        if (this.count >= this.total) {
          this.loaded = true;
          callback();
        }
      };
      img.onerror = () => {
        console.warn('Failed to load: ' + src);
        this.count++;
        this._updateBar();
        if (this.count >= this.total) {
          this.loaded = true;
          callback();
        }
      };
      img.src = src;
    }
  },

  get(key) {
    return this.images[key] || null;
  },

  getSceneBg(sceneId) {
    const key = this.SCENE_BGS[sceneId] || this.SCENE_BGS[0];
    return this.images[key] || null;
  },

  // Get a sprite frame from a sprite sheet
  // Returns { img, sx, sy, sw, sh } for use with drawImage
  _updateBar() {
    const bar = document.getElementById('loadBar');
    if (bar) bar.style.width = Math.round((this.count / this.total) * 100) + '%';
  },

  getSpriteFrame(key, frameIndex, totalFrames) {
    const img = this.images[key];
    if (!img) return null;
    const fw = Math.floor(img.width / totalFrames);
    return {
      img: img,
      sx: frameIndex * fw,
      sy: 0,
      sw: fw,
      sh: img.height
    };
  }
};
