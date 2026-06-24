import { useState, useMemo } from 'react';
import './StockWidget.css';

/* ── Seeded PRNG (mulberry32) for deterministic curves ── */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Box-Muller normal distribution helper ── */
function normalRandom(rand) {
  const u1 = rand() || 1e-10;
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/* ── Generate realistic stock curve with regime switching ── */
function generateStockCurve(seed, direction, numPoints = 120) {
  const rand = mulberry32(seed);
  const W = 212, H = 65;
  const padY = 5;
  const minY = padY, maxY = H - padY;

  // --- Overall bias ---
  const drift = direction === 'up' ? 0.0015 : -0.0015;

  // --- GARCH-like volatility state ---
  let vol = 0.006 + rand() * 0.004;       // base volatility
  const volMean = vol;                     // long-term vol mean
  const volPersist = 0.92 + rand() * 0.05; // GARCH persistence (α+β)
  const volReact = 0.06 + rand() * 0.04;   // reaction to shocks

  // --- Regime state ---
  // Regimes: 'trend' | 'consolidation'
  let regime = rand() < 0.5 ? 'trend' : 'consolidation';
  let regimeLen = 0;
  const avgRegimeLen = 15 + Math.floor(rand() * 20);

  // --- Momentum / mean-reversion ---
  let momentum = 0;
  let trendDir = rand() < 0.5 ? 1 : -1;

  // --- Price series ---
  const prices = [0.5];

  for (let i = 1; i < numPoints; i++) {
    const n = normalRandom(rand);

    // Regime switching
    regimeLen++;
    const switchProb = Math.min(0.8, regimeLen / (avgRegimeLen * 2));
    if (rand() < switchProb * 0.12) {
      regime = regime === 'trend' ? 'consolidation' : 'trend';
      regimeLen = 0;
      if (regime === 'trend') {
        // New trend may align with drift or go random
        trendDir = rand() < 0.65
          ? (direction === 'up' ? 1 : -1)
          : (rand() < 0.5 ? 1 : -1);
      }
    }

    // Update volatility (GARCH-like)
    const shock = n * vol;
    vol = Math.sqrt(
      volMean * volMean * (1 - volPersist) +
      volPersist * vol * vol +
      volReact * shock * shock
    );
    vol = Math.max(0.002, Math.min(0.03, vol));

    // Regime-dependent behavior
    let step;
    if (regime === 'trend') {
      // Trending: momentum + drift + noise
      momentum = momentum * 0.88 + trendDir * vol * 0.4;
      step = momentum + n * vol * 0.6 + drift;
    } else {
      // Consolidation: mean revert to local mean
      const localMean = prices.slice(Math.max(0, i - 12)).reduce((a, b) => a + b, 0)
        / Math.min(i, 12);
      const reversion = (localMean - prices[i - 1]) * (0.08 + rand() * 0.06);
      momentum *= 0.4; // dampen momentum in consolidation
      step = reversion + n * vol * 0.8 + drift * 0.3;
    }

    // Occasional gap (earnings-like spike, ~3% chance)
    if (rand() < 0.03) {
      const gapDir = rand() < 0.6 ? (direction === 'up' ? 1 : -1) : (rand() < 0.5 ? 1 : -1);
      step += gapDir * (0.02 + rand() * 0.03);
    }

    // Micro-noise (tick-level jitter)
    step += normalRandom(rand) * 0.001;

    const next = prices[i - 1] + step;
    prices.push(Math.max(0.01, Math.min(0.99, next)));
  }

  // --- Ensure end aligns with the overall direction ---
  const startPrice = prices[0];
  const endPrice = prices[numPoints - 1];
  const actualDir = endPrice > startPrice ? 'up' : 'down';
  
  // If direction doesn't match, gently warp the latter half
  if (actualDir !== direction) {
    const halfIdx = Math.floor(numPoints * 0.4);
    const deficit = direction === 'up'
      ? Math.max(0.04, startPrice + 0.05 - endPrice)
      : Math.max(0.04, endPrice - (startPrice - 0.05));
    for (let i = halfIdx; i < numPoints; i++) {
      const t = (i - halfIdx) / (numPoints - 1 - halfIdx); // 0→1
      const warp = deficit * t * t; // quadratic ease
      prices[i] += direction === 'up' ? warp : -warp;
      prices[i] = Math.max(0.01, Math.min(0.99, prices[i]));
    }
  }

  // --- Normalize to SVG coordinates ---
  const vMin = Math.min(...prices);
  const vMax = Math.max(...prices);
  const vRange = vMax - vMin || 1;

  return prices.map((v, i) => {
    const x = (i / (numPoints - 1)) * W;
    // Invert Y: higher price → lower y
    const y = maxY - ((v - vMin) / vRange) * (maxY - minY);
    return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
  });
}

/* ── Catmull-Rom → Cubic Bézier smooth path ── */
function smoothPath(points, tension = 0.3) {
  if (points.length < 2) return '';
  if (points.length === 2) return `M${points[0][0]} ${points[0][1]} L${points[1][0]} ${points[1][1]}`;

  let d = `M${points[0][0]} ${points[0][1]}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1[0] + ((p2[0] - p0[0]) * tension);
    const cp1y = p1[1] + ((p2[1] - p0[1]) * tension);
    const cp2x = p2[0] - ((p3[0] - p1[0]) * tension);
    const cp2y = p2[1] - ((p3[1] - p1[1]) * tension);

    d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

const STOCK_DATA = [
  {
    name: "Figma,IncClassA FIG.N",
    price: "7.860",
    change: "+0.170 +2.21%",
    status: "Market Closed",
    trend: "up",
    icon: "icon-arrow-narrow-up-right",
    seed: 42,
  },
  {
    name: "Apple Inc. AAPL",
    price: "189.43",
    change: "-1.24 -0.65%",
    status: "Market Open",
    trend: "down",
    icon: "icon-arrow-narrow-down-right",
    seed: 137,
  },
  {
    name: "Tesla, Inc. TSLA",
    price: "234.12",
    change: "+5.42 +2.37%",
    status: "After Hours",
    trend: "up",
    icon: "icon-arrow-narrow-up-right",
    seed: 256,
  }
];

export default function StockWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('idle');

  const stock = STOCK_DATA[currentIndex];

  const { linePath, fillPath, endY } = useMemo(() => {
    const points = generateStockCurve(stock.seed, stock.trend);
    const line = smoothPath(points);
    const lastPt = points[points.length - 1];
    const firstPt = points[0];
    // Close the fill area: line → bottom-right → bottom-left
    const fill = `${line} L212 65 L${firstPt[0]} 65 Z`;
    return { linePath: line, fillPath: fill, endY: lastPt[1] };
  }, [stock.seed, stock.trend]);

  const handleClick = () => {
    if (phase !== 'idle') return;
    setPhase('out');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % STOCK_DATA.length);
      setPhase('in');
      setTimeout(() => {
        setPhase('idle');
      }, 1500);
    }, 300);
  };

  return (
    <div className={`widget stock-widget ${stock.trend} phase-${phase}`} onClick={handleClick}>
      <div className="stock-content-wrapper">
        <div className="stock-head">
          <strong className="text-animate">{stock.price}<span><i className={`iconfont ${stock.icon}`} /></span></strong>
          <b className="text-animate">{stock.change}</b>
          <small className="text-animate">{stock.status}</small>
        </div>
        <svg key={currentIndex} viewBox="0 0 212 65" aria-hidden="true" className="stock-chart-group">
          <defs>
            <linearGradient id="stock-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--stock-color)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="var(--stock-color)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path className="stock-fill" d={fillPath} />
          <path className="stock-line" pathLength="1" d={linePath} />
        </svg>
        <p className="text-animate">{stock.name}</p>
        <i className="spark iconfont icon-star-05" style={{ top: `${106 + endY}px` }}></i>
      </div>
    </div>
  );
}
