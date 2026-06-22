/**
 * Generate a superellipse SVG path in normalized 0-1 coordinates
 * for use with clipPathUnits="objectBoundingBox".
 *
 * Superellipse: |x/a|^n + |y/b|^n = 1
 * Parametric:  x = a * sgn(cos t) * |cos t|^(2/n)
 *              y = b * sgn(sin t) * |sin t|^(2/n)
 *
 * In the normalized 0-1 space, center is at (0.5, 0.5).
 */
export function generateSuperellipsePath(n = 1.5, segments = 128) {
  const exponent = 2 / n;
  const points = [];

  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * 2 * Math.PI;
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);

    // Normalized coordinates: center at 0.5, span ±0.5
    const x = 0.5 + 0.5 * Math.sign(cosT) * Math.pow(Math.abs(cosT), exponent);
    const y = 0.5 + 0.5 * Math.sign(sinT) * Math.pow(Math.abs(sinT), exponent);

    points.push({ x, y });
  }

  let d = `M ${points[0].x.toFixed(4)} ${points[0].y.toFixed(4)}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    // Quadratic bezier through midpoint for smoothness
    const mx = (prev.x + curr.x) / 2;
    const my = (prev.y + curr.y) / 2;
    d += ` Q ${prev.x.toFixed(4)} ${prev.y.toFixed(4)} ${mx.toFixed(4)} ${my.toFixed(4)}`;
  }

  d += ' Z';
  return d;
}
