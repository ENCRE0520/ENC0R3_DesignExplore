import { useEffect, useRef } from 'react';

const MAX_OFFSET = 12;

function canUseParallax() {
  if (typeof window === 'undefined') {
    return false;
  }

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  return !reducedMotion;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function useWeatherParallax({
  boundaryRef,
  isExpanded = false,
  onParallaxChange,
} = {}) {
  const widgetRef = useRef(null);
  const activeRef = useRef(false);
  const frameRef = useRef(null);
  const pointerRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const onParallaxChangeRef = useRef(onParallaxChange);

  useEffect(() => {
    onParallaxChangeRef.current = onParallaxChange;
  }, [onParallaxChange]);

  useEffect(() => () => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }
  }, []);

  useEffect(() => {
    if (!canUseParallax()) {
      return undefined;
    }

    const widget = widgetRef.current;
    const interactionTarget = isExpanded
      ? window
      : boundaryRef?.current || widget;

    if (!widget || !interactionTarget) {
      return undefined;
    }

    const isMousePointer = (event) => (
      !event.pointerType || event.pointerType === 'mouse'
    );

    const scheduleParallax = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;

        if (!activeRef.current || !widgetRef.current) {
          return;
        }

        widgetRef.current.style.setProperty('--weather-parallax-x', `${offsetRef.current.x}px`);
        widgetRef.current.style.setProperty('--weather-parallax-y', `${offsetRef.current.y}px`);
        onParallaxChangeRef.current?.();
      });
    };

    const handlePointerMove = (event) => {
      if (!isMousePointer(event)) {
        return;
      }

      if (pointerRef.current) {
        const deltaX = event.clientX - pointerRef.current.x;
        const deltaY = event.clientY - pointerRef.current.y;
        offsetRef.current = {
          x: clamp(offsetRef.current.x - deltaX * 0.12, -MAX_OFFSET, MAX_OFFSET),
          y: clamp(offsetRef.current.y - deltaY * 0.12, -MAX_OFFSET, MAX_OFFSET),
        };
      }
      pointerRef.current = { x: event.clientX, y: event.clientY };
      activeRef.current = true;
      widget.setAttribute('data-parallax-active', '');
      scheduleParallax();
    };

    const handlePointerEnter = (event) => {
      if (!isMousePointer(event)) {
        return;
      }

      pointerRef.current = { x: event.clientX, y: event.clientY };
      activeRef.current = true;
      widget.setAttribute('data-parallax-active', '');
      scheduleParallax();
    };

    const handlePointerLeave = (event) => {
      if (!isMousePointer(event)) {
        return;
      }

      activeRef.current = false;
      widget.removeAttribute('data-parallax-active');
    };

    if (isExpanded) {
      activeRef.current = true;
      widget.setAttribute('data-parallax-active', '');
      interactionTarget.addEventListener('pointermove', handlePointerMove);
      interactionTarget.addEventListener('pointerleave', handlePointerLeave);
      window.addEventListener('blur', handlePointerLeave);
      scheduleParallax();
    } else {
      interactionTarget.addEventListener('pointerenter', handlePointerEnter);
      interactionTarget.addEventListener('pointermove', handlePointerMove);
      interactionTarget.addEventListener('pointerleave', handlePointerLeave);
    }

    return () => {
      interactionTarget.removeEventListener('pointerenter', handlePointerEnter);
      interactionTarget.removeEventListener('pointermove', handlePointerMove);
      interactionTarget.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
      activeRef.current = false;
      widget.removeAttribute('data-parallax-active');
    };
  }, [boundaryRef, isExpanded]);

  return { widgetRef };
}
