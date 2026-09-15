import { spring } from '@liquid-dom/react';

export const PRESS_PEAK_SCALE = 1.15;
export const PRESS_REST_SCALE = 1.1;
export const PRESS_RESET_DURATION_MS = 0;
export const PRESS_PEAK_DURATION_MS = 200;
export const PRESS_PEAK_DELAY_MS = 150;
export const PRESS_SETTLE_DURATION_MS = 200;
export const PRESS_RELEASE_DURATION_MS = 300;

export const PRESS_EASE = (progress) => (
  progress < 0.5
    ? 2 * progress ** 2
    : 1 - ((-2 * progress + 2) ** 2) / 2
);

export const LIQUID_DRAG_SPRING = spring({
  stiffness: 480,
  damping: 38,
  mass: 0.75,
  restSpeed: 0.01,
  restDelta: 0.001,
});

const INNER_DRAG_STRENGTH = 0.2;
const FULL_DRAG_STRENGTH = 0.8;
const DRAG_OUTSIDE_RESPONSE_PX = 96;
const DRAG_TENSION_RESPONSE_PX = 120;
const DRAG_TRANSLATE_LIMIT_X = 6;
const DRAG_TRANSLATE_LIMIT_Y = 8;

export function getPressDuration(pressPhase) {
  if (pressPhase === 'release') return PRESS_RELEASE_DURATION_MS;
  if (pressPhase === 'reset') return PRESS_RESET_DURATION_MS;
  if (pressPhase === 'settle') return PRESS_SETTLE_DURATION_MS;
  return PRESS_PEAK_DURATION_MS;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function softLimit(value, limit) {
  return Math.sign(value) * limit * (1 - Math.exp(-Math.abs(value) / limit));
}

function softProgress(distance, responseDistance) {
  if (distance <= 0) return 0;
  return 1 - Math.exp(-((distance / responseDistance) ** 1.35));
}

export function getElasticDragTransform(dx, dy, strength = 1) {
  const distance = Math.hypot(dx, dy);
  if (distance === 0) {
    return {
      scaleX: 1,
      scaleY: 1,
      translateX: 0,
      translateY: 0,
      originX: 0.5,
      originY: 0.5,
    };
  }

  const dampedProgress = 1 - Math.exp(-distance / DRAG_TENSION_RESPONSE_PX);
  const stretch = 1 + dampedProgress * 0.15 * strength;
  const squash = 1 - dampedProgress * 0.045 * strength;
  const axisX = Math.abs(dx) / distance;
  const axisY = Math.abs(dy) / distance;

  return {
    scaleX: stretch * axisX + squash * (1 - axisX),
    scaleY: stretch * axisY + squash * (1 - axisY),
    translateX: softLimit(dx * 0.03 * strength, DRAG_TRANSLATE_LIMIT_X),
    translateY: softLimit(dy * 0.04 * strength, DRAG_TRANSLATE_LIMIT_Y),
    originX: 0.5 - 0.22 * Math.tanh(dx / 48),
    originY: 0.5 - 0.22 * Math.tanh(dy / 48),
  };
}

export function getDragDeformationStrength(point, start) {
  if (!point || !start) return 1;

  const { rawX: x, rawY: y } = point;
  const { width, height } = start;
  let outsideDistance;

  if (start.target === 'playback') {
    const radius = height / 2;
    const endCenterX = clamp(x, radius, width - radius);
    outsideDistance = Math.max(
      0,
      Math.hypot(x - endCenterX, y - radius) - radius,
    );
  } else {
    const radiusX = width / 2;
    const radiusY = height / 2;
    const normalizedDistance = Math.hypot(
      (x - radiusX) / radiusX,
      (y - radiusY) / radiusY,
    );
    outsideDistance = Math.max(0, normalizedDistance - 1) * Math.min(radiusX, radiusY);
  }

  const outsideProgress = softProgress(outsideDistance, DRAG_OUTSIDE_RESPONSE_PX);
  return INNER_DRAG_STRENGTH
    + (FULL_DRAG_STRENGTH - INNER_DRAG_STRENGTH) * outsideProgress;
}

export function getHighlightPointForDrag(point, dragTransform) {
  if (!dragTransform || !point?.width || !point?.height) return point;

  const originX = point.width * (dragTransform.originX ?? 0.5);
  const originY = point.height * (dragTransform.originY ?? 0.5);
  const scaleX = dragTransform.scaleX || 1;
  const scaleY = dragTransform.scaleY || 1;
  const translateX = dragTransform.translateX || 0;
  const translateY = dragTransform.translateY || 0;

  return {
    ...point,
    x: (point.x - originX - translateX) / scaleX + originX,
    y: (point.y - originY - translateY) / scaleY + originY,
  };
}
