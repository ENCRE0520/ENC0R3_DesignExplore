import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  AnimationManager,
  Html,
  LiquidCanvas,
  ZStack,
  easing,
} from '@liquid-dom/react';
import LiquidGlassControl from '../liquid-glass/LiquidGlassControl';
import {
  LIQUID_DRAG_SPRING,
  PRESS_EASE,
  PRESS_PEAK_DELAY_MS,
  PRESS_PEAK_DURATION_MS,
  PRESS_PEAK_SCALE,
  PRESS_RELEASE_DURATION_MS,
  PRESS_REST_SCALE,
  PRESS_SETTLE_DURATION_MS,
  clamp,
  getDragDeformationStrength,
  getElasticDragTransform,
  getHighlightPointForDrag,
  getPressDuration,
} from '../../utils/liquidGlassMotion';
import {
  checkCornerShapeSupport,
  useLiquidGlassRenderer,
} from '../../utils/compatibility';
import styles from './LiquidGlassButton.module.css';

const BUTTON_WIDTH = 156;
const BUTTON_HEIGHT = 48;
const SUPPORTS_CORNER_SHAPE = checkCornerShapeSupport();
const BUTTON_CORNER_RADIUS = 20 * (SUPPORTS_CORNER_SHAPE ? 1 : 1 / 2);
// CSS superellipse(1.35) resolves to an exponent of 2^1.35. Liquid DOM
// expresses that same exponent on a 0–0.6 smoothing scale.
const BUTTON_CORNER_SMOOTHING = SUPPORTS_CORNER_SHAPE ? 0.165 : 0;
const DRAG_TARGET = 'playback';

export default function LiquidGlassButton({
  isSlowMotion = false,
  isCardHovered = false,
  cardBackgroundImage = null,
  isWebGPUSupported = true,
  onCompatibilityError,
}) {
  const [pressed, setPressed] = useState(false);
  const [pressScale, setPressScale] = useState(1);
  const [pressPhase, setPressPhase] = useState('release');
  const [pressHighlight, setPressHighlight] = useState(null);
  const [pressDrag, setPressDrag] = useState(null);
  const [surfaceSize, setSurfaceSize] = useState({ width: 0, height: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => (
    typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));
  const pressedRef = useRef(false);
  const pressScaleTimer = useRef(null);
  const pressScaleFrame = useRef(null);
  const pressScaleRef = useRef(1);
  const pressAnimationFrame = useRef(null);
  const pressAnimationControls = useRef(null);
  const pressAnimationValue = useRef(null);
  const pressAnimationLastTime = useRef(null);
  const pressEndRef = useRef(null);
  const pressPointerStart = useRef(null);
  const pressDragRef = useRef(null);
  const dragAnimationFrame = useRef(null);
  const dragAnimationControls = useRef(null);
  const dragAnimationValue = useRef(null);
  const dragAnimationMeta = useRef(null);
  const dragAnimationLastTime = useRef(null);
  const dragReleaseStarted = useRef(false);
  const rootRef = useRef(null);
  const [dragAnimationManager] = useState(() => new AnimationManager());
  const [pressAnimationManager] = useState(() => new AnimationManager());

  const supportsLiquidDom = isWebGPUSupported
    && typeof navigator !== 'undefined'
    && Boolean(navigator.gpu);
  const hasSurfaceSize = surfaceSize.width > 0 && surfaceSize.height > 0;
  const {
    liquidRef,
    liquidEnabled,
    hasPainted,
    showFallback,
    reportError,
  } = useLiquidGlassRenderer({
    enabled: supportsLiquidDom,
    onError: onCompatibilityError,
    readyKey: hasSurfaceSize,
  });
  const backgroundVisible = isCardHovered;
  const pressDurationMs = getPressDuration(pressPhase);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const syncSurfaceSize = () => {
      const rect = root.getBoundingClientRect();
      const width = Math.round(rect.width * 100) / 100;
      const height = Math.round(rect.height * 100) / 100;

      setSurfaceSize((current) => (
        current.width === width && current.height === height
          ? current
          : { width, height }
      ));
    };

    syncSurfaceSize();
    const observer = new ResizeObserver(syncSurfaceSize);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event) => setPrefersReducedMotion(event.matches);

    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  const getPressPoint = (event) => {
    const surface = event?.currentTarget;
    if (!surface || event.clientX == null || event.clientY == null) return null;

    const rect = surface.getBoundingClientRect();
    const width = surface.offsetWidth || rect.width;
    const height = surface.offsetHeight || rect.height;
    const scaleX = rect.width / width || 1;
    const scaleY = rect.height / height || 1;
    const rawX = (event.clientX - rect.left) / scaleX;
    const rawY = (event.clientY - rect.top) / scaleY;
    const x = clamp(rawX, 0, width);
    const y = clamp(rawY, 0, height);

    return {
      target: DRAG_TARGET,
      x,
      y,
      rawX,
      rawY,
      width,
      height,
      clientX: event.clientX,
      clientY: event.clientY,
      pointerId: event.pointerId ?? null,
      pointerScaleX: scaleX,
      pointerScaleY: scaleY,
    };
  };

  const stopDragAnimation = () => {
    dragAnimationControls.current?.stop();
    dragAnimationControls.current = null;
    if (dragAnimationFrame.current !== null) {
      cancelAnimationFrame(dragAnimationFrame.current);
      dragAnimationFrame.current = null;
    }
    dragAnimationValue.current = null;
    dragAnimationMeta.current = null;
    dragAnimationLastTime.current = null;
  };

  const stopPressScaleAnimation = () => {
    pressAnimationControls.current?.stop();
    pressAnimationControls.current = null;
    if (pressAnimationFrame.current !== null) {
      cancelAnimationFrame(pressAnimationFrame.current);
      pressAnimationFrame.current = null;
    }
    pressAnimationValue.current = null;
    pressAnimationLastTime.current = null;
  };

  const publishPressScale = (value) => {
    pressScaleRef.current = value;
    setPressScale(value);
  };

  const startPressScaleAnimation = (from, to, durationMs) => {
    stopPressScaleAnimation();

    if (prefersReducedMotion || durationMs <= 0 || Math.abs(from - to) < 0.0001) {
      publishPressScale(to);
      return;
    }

    const animatedValue = { scale: from };
    pressAnimationValue.current = animatedValue;
    pressAnimationControls.current = pressAnimationManager.animate(
      animatedValue,
      { scale: to },
      easing({ duration: durationMs / 1000, ease: PRESS_EASE }),
    );

    const tickPressScale = (time) => {
      const value = pressAnimationValue.current;
      if (!value) return;

      const previousTime = pressAnimationLastTime.current ?? time;
      pressAnimationLastTime.current = time;
      pressAnimationManager.tick(Math.max(0, time - previousTime));
      publishPressScale(value.scale);

      if (pressAnimationManager.active) {
        pressAnimationFrame.current = requestAnimationFrame(tickPressScale);
        return;
      }

      publishPressScale(to);
      pressAnimationControls.current = null;
      pressAnimationValue.current = null;
      pressAnimationLastTime.current = null;
      pressAnimationFrame.current = null;
    };

    pressAnimationFrame.current = requestAnimationFrame(tickPressScale);
  };

  const startDragReturn = (currentDrag) => {
    if (!currentDrag || prefersReducedMotion) {
      pressDragRef.current = null;
      setPressDrag(null);
      return;
    }

    stopDragAnimation();
    const animatedValue = {
      scaleX: currentDrag.scaleX,
      scaleY: currentDrag.scaleY,
      translateX: currentDrag.translateX ?? 0,
      translateY: currentDrag.translateY ?? 0,
    };
    dragAnimationValue.current = animatedValue;
    dragAnimationMeta.current = {
      originX: currentDrag.originX,
      originY: currentDrag.originY,
    };
    dragAnimationControls.current = dragAnimationManager.animate(
      animatedValue,
      { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0 },
      LIQUID_DRAG_SPRING,
    );

    const tickDragReturn = (time) => {
      const value = dragAnimationValue.current;
      const meta = dragAnimationMeta.current;
      if (!value || !meta) return;

      const previousTime = dragAnimationLastTime.current ?? time;
      dragAnimationLastTime.current = time;
      dragAnimationManager.tick(Math.max(0, time - previousTime));

      const nextDrag = {
        target: DRAG_TARGET,
        scaleX: value.scaleX,
        scaleY: value.scaleY,
        translateX: value.translateX,
        translateY: value.translateY,
        originX: meta.originX,
        originY: meta.originY,
      };
      pressDragRef.current = nextDrag;
      setPressDrag(nextDrag);

      if (dragAnimationManager.active) {
        dragAnimationFrame.current = requestAnimationFrame(tickDragReturn);
        return;
      }

      // Publish one explicit rest frame before removing the drag object. This
      // prevents React's batched state update from skipping the last spring
      // frame and making the glass snap back to its final position.
      const restDrag = {
        target: DRAG_TARGET,
        scaleX: 1,
        scaleY: 1,
        translateX: 0,
        translateY: 0,
        originX: 0.5,
        originY: 0.5,
      };
      pressDragRef.current = restDrag;
      setPressDrag(restDrag);
      dragAnimationControls.current = null;
      dragAnimationValue.current = null;
      dragAnimationMeta.current = null;
      dragAnimationLastTime.current = null;
      dragAnimationFrame.current = requestAnimationFrame(() => {
        if (pressDragRef.current !== restDrag) return;
        pressDragRef.current = null;
        setPressDrag(null);
        dragReleaseStarted.current = false;
        dragAnimationFrame.current = null;
      });
    };

    dragAnimationFrame.current = requestAnimationFrame(tickDragReturn);
  };

  const handlePressStart = (event) => {
    if (event?.pointerId != null) {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    clearTimeout(pressScaleTimer.current);
    cancelAnimationFrame(pressScaleFrame.current);
    stopPressScaleAnimation();
    stopDragAnimation();

    const point = getPressPoint(event);
    const initialHighlight = point ?? {
      target: DRAG_TARGET,
      x: BUTTON_WIDTH / 2,
      y: BUTTON_HEIGHT / 2,
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
      visible: true,
    };
    pressedRef.current = true;
    pressPointerStart.current = point;
    pressDragRef.current = null;
    dragReleaseStarted.current = false;
    setPressed(true);
    setPressPhase('reset');
    setPressHighlight(initialHighlight);
    setPressDrag(null);
    publishPressScale(1);

    pressScaleFrame.current = requestAnimationFrame(() => {
      pressScaleFrame.current = null;
      setPressPhase('peak');
      startPressScaleAnimation(
        pressScaleRef.current,
        PRESS_PEAK_SCALE,
        PRESS_PEAK_DURATION_MS * (isSlowMotion ? 10 : 1),
      );
      pressScaleTimer.current = setTimeout(() => {
        setPressPhase('settle');
        startPressScaleAnimation(
          pressScaleRef.current,
          PRESS_REST_SCALE,
          PRESS_SETTLE_DURATION_MS * (isSlowMotion ? 10 : 1),
        );
      }, PRESS_PEAK_DELAY_MS * (isSlowMotion ? 10 : 1));
    });
  };

  const handlePressEnd = (event) => {
    const pointerId = pressPointerStart.current?.pointerId;
    if (
      pointerId != null
      && event?.pointerId != null
      && event.pointerId !== pointerId
    ) {
      return;
    }

    const activeDrag = pressDragRef.current?.target === DRAG_TARGET
      ? pressDragRef.current
      : null;
    if (!pressedRef.current && !activeDrag) return;

    pressedRef.current = false;
    setPressed(false);
    pressPointerStart.current = null;
    setPressHighlight((current) => (current ? { ...current, visible: false } : current));
    if (activeDrag && !dragReleaseStarted.current) {
      dragReleaseStarted.current = true;
      startDragReturn(activeDrag);
    } else if (!activeDrag) {
      pressDragRef.current = null;
      setPressDrag(null);
    }

    clearTimeout(pressScaleTimer.current);
    pressScaleTimer.current = null;
    cancelAnimationFrame(pressScaleFrame.current);
    pressScaleFrame.current = null;
    setPressPhase('release');
    startPressScaleAnimation(
      pressScaleRef.current,
      1,
      PRESS_RELEASE_DURATION_MS * (isSlowMotion ? 10 : 1),
    );
  };

  const handlePressMove = (event) => {
    if (!pressedRef.current) return;

    const point = getPressPoint(event);
    if (!point) return;

    const start = pressPointerStart.current;
    if (!start) {
      setPressHighlight({ ...point, visible: true });
      return;
    }

    const dx = (point.clientX - start.clientX) / (start.pointerScaleX || 1);
    const dy = (point.clientY - start.clientY) / (start.pointerScaleY || 1);
    const dragStrength = getDragDeformationStrength(point, start);
    const dragTransform = getElasticDragTransform(dx, dy, dragStrength);
    const dragPoint = {
      ...point,
      x: clamp(start.x + dx, 0, start.width),
      y: clamp(start.y + dy, 0, start.height),
    };
    setPressHighlight({
      ...getHighlightPointForDrag(dragPoint, dragTransform),
      visible: true,
    });

    const nextDrag = {
      target: DRAG_TARGET,
      ...dragTransform,
    };
    pressDragRef.current = nextDrag;
    setPressDrag(nextDrag);
  };

  useLayoutEffect(() => {
    pressEndRef.current = handlePressEnd;
  });

  useEffect(() => {
    if (!pressed) return undefined;

    const releaseFromWindow = (event) => {
      pressEndRef.current?.(event);
    };
    const releaseFromBlur = () => pressEndRef.current?.();
    const releaseFromVisibilityChange = () => {
      if (document.hidden) releaseFromBlur();
    };

    window.addEventListener('pointerup', releaseFromWindow);
    window.addEventListener('pointercancel', releaseFromWindow);
    window.addEventListener('blur', releaseFromBlur);
    document.addEventListener('visibilitychange', releaseFromVisibilityChange);

    return () => {
      window.removeEventListener('pointerup', releaseFromWindow);
      window.removeEventListener('pointercancel', releaseFromWindow);
      window.removeEventListener('blur', releaseFromBlur);
      document.removeEventListener('visibilitychange', releaseFromVisibilityChange);
    };
  }, [pressed]);

  useEffect(() => () => {
    clearTimeout(pressScaleTimer.current);
    cancelAnimationFrame(pressScaleFrame.current);
    stopPressScaleAnimation();
    stopDragAnimation();
    pressedRef.current = false;
    pressDragRef.current = null;
    pressPointerStart.current = null;
  }, []);

  useLayoutEffect(() => {
    if (!liquidEnabled) return undefined;
    const frame = requestAnimationFrame(() => {
      liquidRef.current?.invalidateLayout();
      liquidRef.current?.invalidateFrame();
    });
    return () => cancelAnimationFrame(frame);
  }, [liquidEnabled, liquidRef]);

  useEffect(() => {
    if (!liquidEnabled) return undefined;
    const repaintTimers = [0, 120, 500].map((delay) => (
      setTimeout(() => liquidRef.current?.invalidateFrame(), delay)
    ));
    return () => repaintTimers.forEach((timer) => clearTimeout(timer));
  }, [liquidEnabled, liquidRef]);

  useLayoutEffect(() => {
    if (!liquidEnabled) return;
    liquidRef.current?.invalidateFrame();
    // Drag transforms are shared with the DOM highlight, so the scene layout
    // must consume the new values in the same commit. Press scale stays on the
    // frame-only path below because a layout pass would restart its transition.
    if (pressDrag) {
      liquidRef.current?.invalidateLayout();
    }
  }, [liquidEnabled, liquidRef, backgroundVisible, pressed, pressDrag, pressScale, pressPhase]);

  useEffect(() => {
    if (!liquidEnabled) return undefined;

    // Demand-rendered Liquid DOM needs a short repaint window while the
    // pointer and release spring are updating the shared transform object.
    let animationFrame;
    const startedAt = performance.now();
    const repaint = (time) => {
      if (pressDrag) {
        // The DOM highlight and the Liquid DOM scene are driven by the same
        // drag object. Re-consume layout while that object is changing so a
        // demand-rendered canvas cannot trail the pointer by a frame.
        liquidRef.current?.invalidateLayout();
      }
      liquidRef.current?.invalidateFrame();
      if (time - startedAt < 320) {
        animationFrame = requestAnimationFrame(repaint);
      }
    };

    animationFrame = requestAnimationFrame(repaint);
    return () => cancelAnimationFrame(animationFrame);
  }, [liquidEnabled, liquidRef, pressDrag, pressScale, pressPhase]);

  useEffect(() => {
    if (!liquidEnabled) return undefined;

    const startedAt = performance.now();
    let frame;
    const repaintDuringFade = (time) => {
      liquidRef.current?.invalidateFrame();
      if (time - startedAt < 200) {
        frame = requestAnimationFrame(repaintDuringFade);
      }
    };

    frame = requestAnimationFrame(repaintDuringFade);
    return () => cancelAnimationFrame(frame);
  }, [backgroundVisible, liquidEnabled, liquidRef]);

  const dragStyle = {
    '--drag-scale-x': pressDrag?.target === DRAG_TARGET ? pressDrag.scaleX : 1,
    '--drag-scale-y': pressDrag?.target === DRAG_TARGET ? pressDrag.scaleY : 1,
    '--drag-translate-x': `${pressDrag?.target === DRAG_TARGET ? pressDrag.translateX ?? 0 : 0}px`,
    '--drag-translate-y': `${pressDrag?.target === DRAG_TARGET ? pressDrag.translateY ?? 0 : 0}px`,
    '--drag-origin-x': `${(pressDrag?.target === DRAG_TARGET ? pressDrag.originX : 0.5) * 100}%`,
    '--drag-origin-y': `${(pressDrag?.target === DRAG_TARGET ? pressDrag.originY : 0.5) * 100}%`,
  };
  const highlightStyle = {
    '--highlight-x': `${pressHighlight?.x ?? 0}px`,
    '--highlight-y': `${pressHighlight?.y ?? 0}px`,
  };
  const rootStyle = {
    '--press-scale': pressScale,
    '--press-duration': `${pressDurationMs * (isSlowMotion ? 10 : 1)}ms`,
  };
  const pressStyle = rootStyle;
  const imageStyle = {
    backgroundImage: cardBackgroundImage ? `url("${cardBackgroundImage}")` : 'none',
    opacity: backgroundVisible ? 1 : 0,
  };
  const sceneX = Math.max(0, (surfaceSize.width - BUTTON_WIDTH) / 2);
  const sceneY = Math.max(0, (surfaceSize.height - BUTTON_HEIGHT) / 2);

  return (
    <div
      ref={rootRef}
      className={`${styles.root} liquid-glass-button-root`}
      style={rootStyle}
    >
      {liquidEnabled && hasSurfaceSize && (
        <LiquidCanvas
          ref={liquidRef}
          className={`${styles.canvasHost}${hasPainted ? ` ${styles.canvasReady}` : ''}`}
          style={{ left: 0, top: 0, width: surfaceSize.width, height: surfaceSize.height }}
          canvasClassName={styles.canvas}
          proposal={{ width: surfaceSize.width, height: surfaceSize.height }}
          maxDpr={2}
          frameloop={hasPainted ? 'demand' : 'always'}
          onError={reportError}
        >
          <ZStack alignment="topLeading">
            <Html sizing="fill" zIndex={-2}>
              <div
                className={styles.liquidSourcePress}
                style={{ width: surfaceSize.width, height: surfaceSize.height }}
                onLoadCapture={() => liquidRef.current?.invalidateFrame()}
              >
                <div
                  className={styles.liquidSource}
                >
                  <div
                    className={styles.liquidSourceImage}
                    style={imageStyle}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </Html>
            <LiquidGlassControl
              x={sceneX}
              y={sceneY}
              width={BUTTON_WIDTH}
              height={BUTTON_HEIGHT}
              renderScale={1}
              cornerRadius={BUTTON_CORNER_RADIUS}
              cornerSmoothing={BUTTON_CORNER_SMOOTHING}
              pressScale={pressScale}
              pressPhase={pressPhase}
              pressTransitionEnabled={false}
              dragTransform={pressDrag?.target === DRAG_TARGET ? pressDrag : null}
              shadowSourceClassName={styles.liquidButtonShadow}
              reducedMotion={prefersReducedMotion}
            />
          </ZStack>
        </LiquidCanvas>
      )}

      {showFallback && (
        <span
          className={styles.fallbackPress}
          style={rootStyle}
          aria-hidden="true"
        >
          <span className={styles.fallbackSurface} style={dragStyle} />
        </span>
      )}

      <button
        type="button"
        className={styles.button}
        style={pressStyle}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerCancel={handlePressEnd}
        onPointerLeave={(event) => {
          if (!event.currentTarget.hasPointerCapture?.(event.pointerId)) {
            handlePressEnd(event);
          }
        }}
        onPointerMove={handlePressMove}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
            handlePressStart(event);
          }
        }}
        onKeyUp={handlePressEnd}
        onBlur={(event) => {
          handlePressEnd(event);
        }}
      >
        <span className={styles.dragSurface} style={dragStyle}>
          <span className={styles.hoverHighlight} aria-hidden="true" />
          <span
            className={`${styles.pressHighlight}${pressHighlight?.visible ? ` ${styles.pressHighlightActive}` : ''}`}
            style={highlightStyle}
            aria-hidden="true"
          />
          <span className={styles.label}>Button</span>
        </span>
      </button>
    </div>
  );
}
