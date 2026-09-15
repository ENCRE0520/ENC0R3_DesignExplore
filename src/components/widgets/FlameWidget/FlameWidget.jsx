import { useEffect, useRef } from 'react';
import './FlameWidget.css';

const SIZE = 240;
const CELL = 20;
const GRID = 12;
const CORNER_RADIUS = 32;
const PIXEL_RADIUS = 2;
const SPRITE_PADDING = 8;
const SPRITE_SIZE = CELL + SPRITE_PADDING * 2;

// Base flame profile half-widths by height h = 11 - y (h: 0 = base, 11 = top)
const BASE_OUTER_WIDTH = [
  3.7, // h=0 (y=11)
  3.6, // h=1 (y=10)
  3.3, // h=2 (y=9)
  2.7, // h=3 (y=8)
  2.3, // h=4 (y=7)
  1.8, // h=5 (y=6)
  1.3, // h=6 (y=5)
  0.8, // h=7 (y=4)
  0.4, // h=8 (y=3)
  0.1, // h=9 (y=2)
  0.0, // h=10 (y=1)
  0.0, // h=11 (y=0)
];

const BASE_CORE_WIDTH = [
  1.8, // h=0 (y=11)
  1.8, // h=1 (y=10)
  1.7, // h=2 (y=9)
  1.0, // h=3 (y=8)
  0.6, // h=4 (y=7)
  0.0, // h=5 (y=6)
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
];

function createSurface(width, height, dpr) {
  const canvas = document.createElement('canvas');
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  return { canvas, ctx };
}

function pixelPath(ctx, inset = 0) {
  ctx.beginPath();
  ctx.roundRect(
    SPRITE_PADDING + inset,
    SPRITE_PADDING + inset,
    CELL - inset * 2,
    CELL - inset * 2,
    Math.max(0, PIXEL_RADIUS - inset / 2),
  );
}

function drawInnerShadow(ctx, color, blur, inset = 0) {
  ctx.save();
  pixelPath(ctx, inset);
  ctx.clip();
  pixelPath(ctx, inset);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.filter = `blur(${Math.max(1, blur * 0.42)}px)`;
  ctx.stroke();
  ctx.restore();
}

function renderPixelSprite(dpr, {
  fill,
  border,
  borderWidth,
  innerShadows,
  outerShadow,
}) {
  const raw = createSurface(SPRITE_SIZE, SPRITE_SIZE, dpr);
  const { ctx } = raw;

  ctx.save();
  if (outerShadow) {
    ctx.shadowColor = outerShadow.color;
    ctx.shadowBlur = outerShadow.blur * dpr;
  }
  pixelPath(ctx);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();

  ctx.save();
  pixelPath(ctx, borderWidth / 2);
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = border;
  ctx.stroke();
  ctx.restore();

  innerShadows.forEach(({ color, blur, inset = 0 }) => {
    drawInnerShadow(ctx, color, blur, inset);
  });

  const blurred = createSurface(SPRITE_SIZE, SPRITE_SIZE, dpr);
  blurred.ctx.filter = `blur(${dpr}px)`;
  blurred.ctx.drawImage(raw.canvas, 0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return blurred.canvas;
}

function getSprite(cache, dpr, tier, opacity = 1) {
  const normalizedOpacity = Math.max(0.05, Math.min(1, Math.round(opacity * 20) / 20));
  const key = `${tier}:${normalizedOpacity}`;
  if (cache.has(key)) return cache.get(key);

  let options;
  if (tier === 2) {
    options = {
      fill: '#fffffe',
      border: '#fffad1',
      borderWidth: 2,
      outerShadow: { color: '#fff', blur: 4 },
      innerShadows: [{ color: '#fff1ac', blur: 10, inset: -2 }],
    };
  } else if (tier === 1) {
    const alpha = normalizedOpacity;
    options = {
      fill: alpha >= 0.95 ? '#feccab' : `rgba(254, 204, 171, ${alpha})`,
      border: alpha >= 0.95 ? '#e2362a' : `rgba(226, 54, 42, ${alpha})`,
      borderWidth: 1,
      innerShadows: [{
        color: alpha >= 0.95 ? '#ff0000' : `rgba(255, 0, 0, ${alpha})`,
        blur: 10,
        inset: -0.5,
      }],
    };
  } else {
    options = {
      fill: `rgba(255, 30, 0, ${normalizedOpacity})`,
      border: '#000',
      borderWidth: 1,
      innerShadows: [
        { color: 'rgba(0, 0, 0, 0.4)', blur: 15 },
        { color: '#000', blur: 10 },
      ],
    };
  }

  const sprite = renderPixelSprite(dpr, options);
  cache.set(key, sprite);
  return sprite;
}

function getFlameCenter(h, t) {
  // Base anchored at h=0 with sway increasing upward; negative h ensures upward ripple flow
  const sway1 = Math.sin(t * 2.8 - h * 0.65) * h * 0.08;
  const sway2 = Math.sin(t * 4.4 - h * 1.15 + 1.2) * h * 0.045;
  return 5.5 + sway1 + sway2;
}

function getAmbientOpacity(x, y, t) {
  const h = 11 - y;
  const verticalHeat = (11 - y) / 11;
  const centerDist = Math.abs(x - 5.5);
  const centerHeat = Math.max(0, 1 - centerDist / 5.5);
  // Convective upward air wave in background ambient field
  const airWave = Math.sin(t * 2.4 - h * 0.6 + x * 0.3) * 0.035;
  const flicker = Math.sin(t * 3.8 + x * 1.9 + y * 2.7) * 0.02;
  const opacity = 0.18 + verticalHeat * 0.52 + centerHeat * 0.08 + airWave + flicker;
  return Math.min(0.9, Math.max(0.18, opacity));
}

function drawSprite(ctx, sprite, x, y) {
  ctx.drawImage(
    sprite,
    x * CELL - SPRITE_PADDING,
    y * CELL - SPRITE_PADDING,
    SPRITE_SIZE,
    SPRITE_SIZE,
  );
}

class EmberManager {
  constructor() {
    this.embers = [];
    this.nextSpawnTime = 0;
  }

  update(dt, t) {
    this.nextSpawnTime -= dt;
    if (this.nextSpawnTime <= 0) {
      this.nextSpawnTime = 0.22 + Math.random() * 0.24;
      const fromShoulder = Math.random() < 0.35;
      let spawnX;
      let spawnY;
      let vx;
      let vy;
      let maxLife;

      if (fromShoulder) {
        const goLeft = Math.random() < 0.5;
        spawnX = goLeft ? 3.0 + Math.random() * 0.8 : 7.2 + Math.random() * 0.8;
        spawnY = 6.0 + Math.random() * 2.0;
        vx = (goLeft ? -0.8 : 0.8) + (Math.random() - 0.5) * 0.4;
        vy = -2.2 - Math.random() * 1.2;
        maxLife = 1.0 + Math.random() * 0.5;
      } else {
        const h = 6;
        const sway = Math.sin(t * 2.8 - h * 0.65) * h * 0.08;
        spawnX = 5.5 + sway + (Math.random() - 0.5) * 1.2;
        spawnY = 4.0 + Math.random() * 1.5;
        vx = (Math.random() - 0.5) * 0.6;
        vy = -2.8 - Math.random() * 1.4;
        maxLife = 1.2 + Math.random() * 0.6;
      }

      this.embers.push({
        x: spawnX,
        y: spawnY,
        vx,
        vy,
        life: 1.0,
        maxLife,
        seed: Math.random() * Math.PI * 2,
      });
    }

    for (let i = this.embers.length - 1; i >= 0; i -= 1) {
      const e = this.embers[i];
      e.life -= dt / e.maxLife;
      e.y += e.vy * dt;
      e.x += (e.vx + Math.sin(t * 3.2 + e.seed) * 0.35) * dt;
      if (e.life <= 0 || e.y < -0.8 || e.x < 0 || e.x > 11.5) {
        this.embers.splice(i, 1);
      }
    }
  }
}

function renderFlameFrame(ctx, dpr, t, spriteCache, emberManager) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, SIZE, SIZE, CORNER_RADIUS);
  ctx.clip();
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, SIZE, SIZE);

  // 1. Render 12x12 background matrix with convective upward glow
  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      const opacity = getAmbientOpacity(x, y, t);
      drawSprite(ctx, getSprite(spriteCache, dpr, 0, opacity), x, y);
    }
  }

  // 2. Calculate flame active cells with upward traveling convection pulses
  const flameState = new Map();

  for (let y = 0; y < GRID; y += 1) {
    const h = 11 - y;
    const centerX = getFlameCenter(h, t);

    // Upward traveling heat pulse wave (phase increases with time, lags with height)
    const heatWave1 = Math.sin(t * 3.2 - h * 0.75);
    const heatWave2 = Math.sin(t * 5.2 - h * 1.35 + 0.8) * 0.45;
    const heatPulse = (heatWave1 + heatWave2) / 1.45;

    for (let x = 0; x < GRID; x += 1) {
      const leftTongue = Math.sin(t * 3.6 - h * 0.85);
      const rightTongue = Math.sin(t * 3.6 - h * 0.85 + Math.PI * 0.75);
      const tongueMod = (x <= centerX ? leftTongue : rightTongue) * (h >= 5 ? 0.35 : 0.0);

      const dynamicOuterWidth = Math.max(
        0,
        BASE_OUTER_WIDTH[h] + heatPulse * (0.15 + h * 0.06) + tongueMod,
      );
      const isOuter = Math.abs(x - centerX) <= dynamicOuterWidth;

      if (isOuter) {
        const coreSurge = Math.max(0, heatPulse - 0.3) * 0.8;
        const dynamicCoreWidth = Math.max(
          0,
          BASE_CORE_WIDTH[h] + (h === 4 ? coreSurge * 0.6 : (h === 5 ? coreSurge * 0.4 : 0)),
        );
        const isCore = Math.abs(x - centerX) <= dynamicCoreWidth;

        flameState.set(`${x}:${y}`, {
          x,
          y,
          tier: isCore ? 2 : 1,
          opacity: 1,
        });
      }
    }
  }

  // 3. Overlay rising ember particles
  if (emberManager) {
    emberManager.embers.forEach((ember) => {
      const cx = Math.round(ember.x);
      const cy = Math.round(ember.y);
      if (cx >= 0 && cx < GRID && cy >= 0 && cy < GRID) {
        const key = `${cx}:${cy}`;
        const existing = flameState.get(key);
        if (!existing || existing.tier < 2) {
          const fade = Math.min(1, ember.life * 1.8, (cy + 0.5) / 2.2);
          const opacity = Math.max(0.25, fade);
          flameState.set(key, {
            x: cx,
            y: cy,
            tier: 1,
            opacity: existing ? 1 : opacity,
          });
        }
      }
    });
  }

  // 4. Draw active flame pixels
  flameState.forEach(({ x, y, tier, opacity }) => {
    drawSprite(ctx, getSprite(spriteCache, dpr, tier, opacity), x, y);
  });

  ctx.restore();
}

function setupDisplayCanvas(canvas, dpr) {
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  return ctx;
}

export default function FlameWidget() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = setupDisplayCanvas(canvas, dpr);
    const spriteCache = new Map();
    const emberManager = new EmberManager();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId;
    let lastTime = performance.now();
    let isVisible = false;

    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const t = now / 1000;

      emberManager.update(dt, t);
      renderFlameFrame(ctx, dpr, t, spriteCache, emberManager);

      if (isVisible && !document.hidden && !reduceMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const stop = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = undefined;
      }
    };

    const start = () => {
      stop();
      if (reduceMotion || !isVisible || document.hidden) {
        // Draw static baseline frame for reduced motion or paused state
        renderFlameFrame(ctx, dpr, 0, spriteCache, null);
        return;
      }
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => (document.hidden ? stop() : start());

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) start();
      else stop();
    }, { rootMargin: '80px' });

    observer.observe(root);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial render
    start();

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div ref={rootRef} className="widget flame-widget" aria-label="Animated pixel flame" role="img">
      <canvas ref={canvasRef} className="flame-canvas" width="240" height="240" aria-hidden="true" />
    </div>
  );
}
