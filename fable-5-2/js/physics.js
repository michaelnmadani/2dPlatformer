// Physics constants and collision detection
const Physics = {
    GRAVITY: 0.6,
    JUMP_FORCE: -13,
    MOVE_SPEED: 4.5,
    FRICTION: 0.85,
    MAX_FALL_SPEED: 12,
    JUMP_HOLD_FORCE: -0.4,
    MAX_JUMP_HOLD_TIME: 12,

    applyGravity(entity, dt) {
        entity.vy = Math.min(entity.vy + this.GRAVITY, this.MAX_FALL_SPEED);
        entity.y += entity.vy;
        entity.x += entity.vx;
        entity.vx *= this.FRICTION;
    },

    checkPlatformCollision(entity, platforms) {
        let onPlatform = false;
        let landedPlatform = null;

        for (const p of platforms) {
            if (!p.active) continue;

            const px = p.x + (p.offsetX || 0);
            const py = p.y + (p.offsetY || 0) + (p.bobY || 0);

            // Check if frog is above the platform and falling
            const entityBottom = entity.y + entity.height;
            const entityRight = entity.x + entity.width;
            const prevBottom = entityBottom - entity.vy;

            const horizontalOverlap = entity.x + entity.width * 0.1 < px + p.width &&
                                      entity.x + entity.width * 0.9 > px;

            if (horizontalOverlap &&
                entityBottom >= py &&
                prevBottom <= py + 14 &&
                entity.vy >= 0) {
                entity.y = py - entity.height;
                entity.vy = 0;
                onPlatform = true;
                landedPlatform = p;
            }
        }

        return { onPlatform, platform: landedPlatform };
    },

    checkWaterCollision(entity, waterLevel) {
        return entity.y + entity.height > waterLevel;
    },

    checkEntityCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }
};
