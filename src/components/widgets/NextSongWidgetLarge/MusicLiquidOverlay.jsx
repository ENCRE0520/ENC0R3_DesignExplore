import { useEffect, useLayoutEffect } from 'react';
import {
  Html,
  LiquidCanvas,
  ZStack,
} from '@liquid-dom/react';
import LiquidGlassControl from '../../liquid-glass/LiquidGlassControl';
import { useLiquidGlassRenderer } from '../../../utils/compatibility';
import {
  getPressDuration,
} from '../../../utils/liquidGlassMotion';

const COMPACT_CANVAS_WIDTH = 240;
const WIDE_CANVAS_WIDTH = 514;
const CANVAS_HEIGHT = 240;
const CONTROL_TOP = 178;
const PLAYBACK_LEFT = 14;
const NEXT_LEFT = 178;
const PLAYBACK_WIDTH = 144;
const CONTROL_SIZE = 48;

function FallbackGlassControl({ target, pressedControl, pressScale, pressDrag }) {
  const activeDrag = pressDrag?.target === target ? pressDrag : null;

  return (
    <div
      className={`nsw-liquid-fallback-press nsw-liquid-fallback-press--${target}`}
      style={{
        '--nsw-liquid-press-scale': pressedControl === target ? pressScale : 1,
      }}
    >
      <div
        className="nsw-liquid-fallback-control"
        style={{
          '--nsw-liquid-drag-scale-x': activeDrag?.scaleX ?? 1,
          '--nsw-liquid-drag-scale-y': activeDrag?.scaleY ?? 1,
          '--nsw-liquid-drag-translate-x': `${activeDrag?.translateX ?? 0}px`,
          '--nsw-liquid-drag-translate-y': `${activeDrag?.translateY ?? 0}px`,
          '--nsw-liquid-drag-origin-x': activeDrag?.originX ?? 0.5,
          '--nsw-liquid-drag-origin-y': activeDrag?.originY ?? 0.5,
        }}
      />
    </div>
  );
}

export default function MusicLiquidOverlay({
  children,
  compact = false,
  isExpanded = false,
  contentVersion = 0,
  isAnimating = false,
  pressedControl = null,
  pressScale = 1,
  pressPhase = 'release',
  pressDrag = null,
  reducedMotion = false,
  isWebGPUSupported = true,
  onCompatibilityError,
}) {
  const supportsLiquidDom = isWebGPUSupported
    && typeof navigator !== 'undefined'
    && Boolean(navigator.gpu);
  // Keep Liquid DOM mounted when the browser exposes the required WebGPU API.
  // Unsupported environments use the authored DOM fallback instead of letting
  // the renderer throw on every frame and leave the widget visually unstable.
  const {
    liquidRef,
    liquidEnabled,
    hasPainted,
    showFallback,
    reportError,
  } = useLiquidGlassRenderer({
    enabled: supportsLiquidDom,
    onError: onCompatibilityError,
  });
  // Keep a DOM fallback visible until the first GPU paint, or when the
  // renderer reports an error, so startup never leaves the widget blank.
  // Render the authored scene at its real width for both variants. The wide
  // widget must be one continuous Liquid DOM surface; stopping at 240px makes
  // the canvas meet the normal DOM at a visible vertical seam.
  const canvasWidth = compact ? COMPACT_CANVAS_WIDTH : WIDE_CANVAS_WIDTH;
  // The renderer maps its proposal 1:1 into the canvas. In preview, render a
  // half-sized scene and scale the copied source by the same amount; in the
  // expanded state, render the authored scene at full size.
  const renderScale = isExpanded ? 1 : 0.5;
  const renderWidth = canvasWidth * renderScale;
  const renderHeight = CANVAS_HEIGHT * renderScale;
  const outputWidth = isExpanded ? canvasWidth : canvasWidth * 0.5;
  const outputHeight = isExpanded ? CANVAS_HEIGHT : CANVAS_HEIGHT * 0.5;
  const outputTransform = isExpanded ? 'scale(.5)' : 'none';
  const pressDurationMs = getPressDuration(pressPhase);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      liquidRef.current?.renderer?.syncCanvasSize();
      liquidRef.current?.invalidateLayout();
      liquidRef.current?.invalidateFrame();
    });

    return () => cancelAnimationFrame(frame);
  }, [isExpanded, liquidRef, renderScale]);

  useEffect(() => {
    // The card expands with a parent transform. ResizeObserver does not report
    // that transform-only size change, so sync once after the FLIP transition.
    const timer = setTimeout(() => {
      liquidRef.current?.renderer?.syncCanvasSize();
      liquidRef.current?.invalidateLayout();
      liquidRef.current?.invalidateFrame();
    }, isExpanded ? 420 : 0);

    return () => clearTimeout(timer);
  }, [isExpanded, liquidRef]);

  useEffect(() => {
    if (!liquidEnabled) {
      return undefined;
    }

    const repaintTimers = [0, 120, 500].map((delay) => (
      setTimeout(() => {
        liquidRef.current?.invalidateFrame();
      }, delay)
    ));

    return () => repaintTimers.forEach((timer) => clearTimeout(timer));
  }, [liquidEnabled, liquidRef]);

  useEffect(() => {
    if (!liquidEnabled) return undefined;

    let animationFrame;
    const startedAt = performance.now();
    const repaint = (time) => {
      if (pressDrag) {
        liquidRef.current?.invalidateLayout();
      }
      liquidRef.current?.invalidateFrame();
      if (isAnimating || time - startedAt < 320) {
        animationFrame = requestAnimationFrame(repaint);
      }
    };

    animationFrame = requestAnimationFrame(repaint);
    return () => cancelAnimationFrame(animationFrame);
  }, [contentVersion, isAnimating, liquidEnabled, liquidRef, pressDrag, pressScale, pressPhase]);

  useLayoutEffect(() => {
    if (!liquidEnabled) return;
    liquidRef.current?.invalidateFrame();
    if (pressDrag) {
      liquidRef.current?.invalidateLayout();
    }
  }, [liquidEnabled, liquidRef, pressedControl, pressDrag, pressScale, pressPhase]);

  return (
    <div
      className={`nsw-liquid-overlay${showFallback ? ' nsw-liquid-overlay--fallback' : ''}${!isExpanded ? ' nsw-liquid-overlay--preview' : ''}`}
      style={{
        width: outputWidth,
        height: outputHeight,
        transform: outputTransform,
        transformOrigin: 'top left',
        '--nsw-liquid-press-duration': `${pressDurationMs}ms`,
      }}
      aria-hidden="true"
    >
      {showFallback && (
        <div className="nsw-liquid-fallback">
          {compact && <div className="nsw-liquid-fallback-visual">{children}</div>}
          <FallbackGlassControl
            target="playback"
            pressedControl={pressedControl}
            pressScale={pressScale}
            pressDrag={pressDrag}
          />
          <FallbackGlassControl
            target="queue"
            pressedControl={pressedControl}
            pressScale={pressScale}
            pressDrag={pressDrag}
          />
        </div>
      )}
      {liquidEnabled && (
        <LiquidCanvas
          ref={liquidRef}
          className={`nsw-liquid-canvas-host${hasPainted ? ' nsw-liquid-canvas-host--ready' : ''}`}
          style={{
            width: outputWidth,
            height: outputHeight,
          }}
          canvasClassName="nsw-liquid-canvas"
          proposal={{ width: renderWidth, height: renderHeight }}
          maxDpr={2}
          frameloop={hasPainted ? 'demand' : 'always'}
          onError={reportError}
        >
          <ZStack alignment="topLeading">
            <Html sizing="fill" zIndex={-2}>
              <div
                className="nsw-liquid-source-shell"
                style={{
                  width: canvasWidth,
                  height: CANVAS_HEIGHT,
                  transform: `scale(${renderScale})`,
                  transformOrigin: 'top left',
                }}
                onLoadCapture={() => liquidRef.current?.invalidateFrame()}
              >
                {children}
              </div>
            </Html>

            <LiquidGlassControl
              x={PLAYBACK_LEFT}
              y={CONTROL_TOP}
              width={PLAYBACK_WIDTH}
              height={CONTROL_SIZE}
              renderScale={renderScale}
              pressScale={pressedControl === 'playback' ? pressScale : 1}
              pressPhase={pressPhase}
              dragTransform={pressDrag?.target === 'playback' ? pressDrag : null}
              reducedMotion={reducedMotion}
            />
            <LiquidGlassControl
              x={NEXT_LEFT}
              y={CONTROL_TOP}
              width={CONTROL_SIZE}
              height={CONTROL_SIZE}
              renderScale={renderScale}
              pressScale={pressedControl === 'queue' ? pressScale : 1}
              pressPhase={pressPhase}
              dragTransform={pressDrag?.target === 'queue' ? pressDrag : null}
              reducedMotion={reducedMotion}
            />
          </ZStack>
        </LiquidCanvas>
      )}
    </div>
  );
}
