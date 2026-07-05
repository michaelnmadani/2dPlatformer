// entities.js - Game entity factory functions for 2D Platformer
// All functions are plain globals, no modules/imports

function createFrog(x, y) {
  var frog = {
    x: x,
    y: y,
    width: 30,
    height: 28,
    vx: 0,
    vy: 0,
    onGround: false,
    jumping: false,
    jumpHoldTime: 0,
    facing: 1,
    alive: true,
    respawnX: x,
    respawnY: y,

    reset: function () {
      this.x = this.respawnX;
      this.y = this.respawnY;
      this.vx = 0;
      this.vy = 0;
      this.onGround = false;
      this.jumping = false;
      this.jumpHoldTime = 0;
      this.alive = true;
    },

    jump: function () {
      if (this.onGround) {
        this.vy = -13; // Physics.JUMP_FORCE
        this.jumping = true;
        this.jumpHoldTime = 0;
      }
    },

    holdJump: function () {
      if (this.jumping && this.jumpHoldTime < 12) {
        this.vy += -0.4;
        this.jumpHoldTime++;
      }
    },

    moveLeft: function () {
      this.vx -= 4.5 * 0.3;
      this.facing = -1;
    },

    moveRight: function () {
      this.vx += 4.5 * 0.3;
      this.facing = 1;
    }
  };

  return frog;
}

function createPrince(x, y) {
  var prince = {
    x: x,
    y: y,
    width: 30,
    height: 45,
    transformProgress: 0,
    transforming: false,
    kissed: false,

    startTransform: function () {
      this.transforming = true;
      this.kissed = true;
    },

    updateTransform: function (dt) {
      if (this.transforming && this.transformProgress < 1) {
        this.transformProgress += 0.01;
        if (this.transformProgress > 1) {
          this.transformProgress = 1;
        }
      }
    }
  };

  return prince;
}

function createLilypad(config) {
  var x = config.x;
  var y = config.y;
  var width = config.width || 80;
  var type = config.type || 'static';

  var lilypad = {
    x: x,
    y: y,
    width: width,
    height: 15,
    type: type,
    active: true,
    offsetX: 0,
    offsetY: 0,
    prevOffsetX: 0,
    moveSpeed: config.moveSpeed || 1,
    moveRange: config.moveRange || 60,
    moveStartX: x,
    sinkTimer: 0,
    sinkSpeed: 0.5,
    maxSink: 20,
    sinking: false,
    disappearTimer: 0,
    disappearDelay: 90,
    opacity: 1,
    disappearing: false,
    hasFlower: Math.random() > 0.7,
    flowerType: Math.floor(Math.random() * 5),
    variant: Math.floor(Math.random() * 10),

    update: function (time) {
      this.prevOffsetX = this.offsetX;

      // Water bob — gentle up/down matching the water surface
      var worldX = this.x + (this.offsetX || 0);
      this.bobY = Math.sin(worldX * 0.02 + time * 0.002) * 3
                + Math.sin(worldX * 0.013 + time * 0.0015) * 2;

      if (this.type === 'moving') {
        this.offsetX = Math.sin(time * 0.001 * this.moveSpeed) * this.moveRange;
      }

      if (this.type === 'sinking' && this.sinking) {
        this.offsetY += this.sinkSpeed;
        if (this.offsetY > this.maxSink) {
          this.active = false;
        }
      }

      if (this.type === 'disappearing' && this.disappearing) {
        this.disappearTimer++;
        if (this.disappearTimer > this.disappearDelay) {
          this.opacity -= 0.05;
          if (this.opacity <= 0) {
            this.opacity = 0;
            this.active = false;
          }
        }
      }
    },

    startSinking: function () {
      if (this.type === 'sinking') {
        this.sinking = true;
      }
    },

    startDisappearing: function () {
      if (this.type === 'disappearing') {
        this.disappearing = true;
      }
    },

    reset: function () {
      this.active = true;
      this.offsetX = 0;
      this.offsetY = 0;
      this.prevOffsetX = 0;
      this.opacity = 1;
      this.sinking = false;
      this.disappearing = false;
      this.sinkTimer = 0;
      this.disappearTimer = 0;
    }
  };

  return lilypad;
}

function createDragonfly(x, y, patrolRange) {
  var dragonfly = {
    x: x,
    y: y,
    width: 20,
    height: 15,
    startX: x,
    patrolRange: patrolRange || 100,
    speed: 1.5,
    direction: 1,
    active: true,

    update: function () {
      this.x += this.speed * this.direction;
      if (this.x > this.startX + this.patrolRange || this.x < this.startX - this.patrolRange) {
        this.direction *= -1;
      }
    }
  };

  return dragonfly;
}

function createParticle(x, y, type) {
  var vx, vy, size, decay;

  decay = 0.02;

  if (type === 'splash') {
    vx = (Math.random() - 0.5) * 6;
    vy = -(Math.random() * 4.5 + 1);
    size = 2 + Math.random() * 3.5;
  } else if (type === 'heart') {
    vx = (Math.random() - 0.5) * 0.5;
    vy = -(Math.random() * 0.5 + 0.5);
    size = 8;
  } else if (type === 'sparkle') {
    vx = (Math.random() - 0.5) * 3;
    vy = (Math.random() - 0.5) * 3;
    size = 5;
  } else if (type === 'wind') {
    vx = Math.random() * 2 + 1;
    vy = (Math.random() - 0.5) * 0.5;
    size = 3;
  } else {
    vx = 0;
    vy = 0;
    size = 4;
  }

  var particle = {
    x: x,
    y: y,
    type: type,
    vx: vx,
    vy: vy,
    life: 1.0,
    decay: decay,
    size: size,
    active: true,

    update: function () {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;

      if (this.life <= 0) {
        this.life = 0;
        this.active = false;
      }

      if (this.type === 'splash') {
        this.vy += 0.1;
      }

      if (this.type === 'heart') {
        this.vy *= 0.98;
        this.x += Math.sin(this.y * 0.1) * 0.3;
      }
    }
  };

  return particle;
}

function createFish(x, y) {
  // 5 sizes: tiny, small, medium, large, big
  var sizeIndex = Math.floor(Math.random() * 5);
  var sizes = [
    { name: 'tiny',   bodyLen: 8,  bodyH: 3,  tailW: 4,  tailH: 3,  speed: 0.8 },
    { name: 'small',  bodyLen: 12, bodyH: 5,  tailW: 6,  tailH: 4,  speed: 0.6 },
    { name: 'medium', bodyLen: 18, bodyH: 7,  tailW: 8,  tailH: 6,  speed: 0.45 },
    { name: 'large',  bodyLen: 24, bodyH: 9,  tailW: 10, tailH: 8,  speed: 0.35 },
    { name: 'big',    bodyLen: 32, bodyH: 12, tailW: 14, tailH: 10, speed: 0.25 }
  ];
  var s = sizes[sizeIndex];

  // 5 colours
  var colorIndex = Math.floor(Math.random() * 5);
  var colors = [
    { body: '#e88840', belly: '#ffcc88', fin: '#d06020', eye: '#221100' },  // Orange/goldfish
    { body: '#5588cc', belly: '#aaccee', fin: '#3366aa', eye: '#112244' },  // Blue
    { body: '#cc4455', belly: '#ee9999', fin: '#aa2233', eye: '#220011' },  // Red
    { body: '#88bb44', belly: '#ccee88', fin: '#668822', eye: '#223300' },  // Green
    { body: '#cc88dd', belly: '#eeccff', fin: '#aa66bb', eye: '#331144' }   // Purple
  ];
  var c = colors[colorIndex];

  var direction = Math.random() > 0.5 ? 1 : -1;
  var baseSpeed = s.speed * (0.7 + Math.random() * 0.6);
  var swimPhase = Math.random() * Math.PI * 2;
  var depthWobble = Math.random() * Math.PI * 2;

  return {
    x: x,
    y: y,
    baseY: y,
    direction: direction,
    speed: baseSpeed,
    sizeIndex: sizeIndex,
    colorIndex: colorIndex,
    bodyLen: s.bodyLen,
    bodyH: s.bodyH,
    tailW: s.tailW,
    tailH: s.tailH,
    bodyColor: c.body,
    bellyColor: c.belly,
    finColor: c.fin,
    eyeColor: c.eye,
    swimPhase: swimPhase,
    depthWobble: depthWobble,
    tailAngle: 0,

    update: function (time, levelWidth) {
      // Swim forward
      this.x += this.speed * this.direction;

      // Wrap around level bounds with margin
      if (this.direction > 0 && this.x > levelWidth + 50) {
        this.x = -50;
      } else if (this.direction < 0 && this.x < -50) {
        this.x = levelWidth + 50;
      }

      // Gentle vertical bobbing
      this.y = this.baseY + Math.sin(time * 0.001 + this.depthWobble) * 6;

      // Tail wag
      this.tailAngle = Math.sin(time * 0.006 + this.swimPhase) * 0.4;
    }
  };
}
