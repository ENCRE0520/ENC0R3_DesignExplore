import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

let liquidGlassSupport = null;
let liquidGlassCheckPromise = null;

export const LIQUID_GLASS_UNSUPPORTED_REASON = {
  FORCED: 'forced',
  WEBGPU: 'webgpu',
  ADAPTER: 'adapter',
  CANVAS_CONTEXT: 'canvas-context',
  HTML_IN_CANVAS: 'html-in-canvas',
};

/**
 * Checks whether WebGPU is forced to unsupported mode via URL parameter or global flag (for testing).
 */
export function isWebGPUForceDisabled() {
  if (typeof window === 'undefined') return false;
  if (window.__FORCE_UNSUPPORTED_WEBGPU__ === true) return true;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('test-unsupported') === '1' || params.has('no-webgpu');
  } catch {
    return false;
  }
}

/**
 * Synchronous quick check for WebGPU support.
 */
export function checkWebGPUSync() {
  if (isWebGPUForceDisabled()) return false;
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
  return Boolean(navigator.gpu);
}

/**
 * Liquid DOM also depends on Chromium's experimental HTML-in-Canvas API.
 * WebGPU alone is not enough for its DOM-backed glass surfaces.
 */
export function checkLiquidGlassSync() {
  if (isWebGPUForceDisabled()) {
    return { supported: false, reason: LIQUID_GLASS_UNSUPPORTED_REASON.FORCED };
  }

  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { supported: true, reason: null };
  }

  if (!navigator.gpu) {
    return { supported: false, reason: LIQUID_GLASS_UNSUPPORTED_REASON.WEBGPU };
  }

  const canvasPrototype = typeof HTMLCanvasElement === 'undefined'
    ? null
    : HTMLCanvasElement.prototype;
  const hasPaintLifecycle = Boolean(
    canvasPrototype
    && ('onpaint' in canvasPrototype || 'requestPaint' in canvasPrototype),
  );

  if (!hasPaintLifecycle) {
    return { supported: false, reason: LIQUID_GLASS_UNSUPPORTED_REASON.HTML_IN_CANVAS };
  }

  return { supported: true, reason: null };
}

/**
 * Checks the custom corner shape syntax used throughout the gallery.
 */
export function checkCornerShapeSupport() {
  if (typeof window === 'undefined') return true;
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') return false;
  return CSS.supports('corner-shape: squircle')
    && CSS.supports('corner-shape: superellipse(1.35)');
}

/**
 * Full check for WebGPU, validating adapter availability asynchronously.
 */
export async function checkLiquidGlassAsync() {
  const syncSupport = checkLiquidGlassSync();
  if (!syncSupport.supported) {
    liquidGlassSupport = syncSupport;
    return syncSupport;
  }

  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return syncSupport;
  }

  if (liquidGlassSupport !== null) {
    return liquidGlassSupport;
  }

  if (!liquidGlassCheckPromise) {
    liquidGlassCheckPromise = (async () => {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
          return {
            supported: false,
            reason: LIQUID_GLASS_UNSUPPORTED_REASON.ADAPTER,
          };
        }

        const device = await adapter.requestDevice();
        const context = document.createElement('canvas').getContext('webgpu');
        if (!context) {
          device.destroy?.();
          return {
            supported: false,
            reason: LIQUID_GLASS_UNSUPPORTED_REASON.CANVAS_CONTEXT,
          };
        }

        const queue = device.queue;
        const hasElementTextureCopy = (
          typeof queue.drawElementImageToTexture === 'function'
          || typeof queue.copyElementImageToTexture === 'function'
        );
        device.destroy?.();
        return hasElementTextureCopy
          ? { supported: true, reason: null }
          : {
            supported: false,
            reason: LIQUID_GLASS_UNSUPPORTED_REASON.HTML_IN_CANVAS,
          };
      } catch {
        return {
          supported: false,
          reason: LIQUID_GLASS_UNSUPPORTED_REASON.WEBGPU,
        };
      }
    })().then((support) => {
      liquidGlassSupport = support;
      return support;
    });
  }

  return liquidGlassCheckPromise;
}

export async function checkWebGPUAsync() {
  const support = await checkLiquidGlassAsync();
  return support.supported;
}

/**
 * React hook to check feature support for a given card.
 * @param {boolean} requiresWebGPU - Whether this item requires WebGPU
 * @returns {{ isSupported: boolean }}
 */
export function useWebGPUSupport(requiresWebGPU = false) {
  const [asyncSupport, setAsyncSupport] = useState(() => {
    if (!requiresWebGPU) return { supported: true, reason: null };
    const syncSupport = checkLiquidGlassSync();
    return syncSupport.supported ? null : syncSupport;
  });

  useEffect(() => {
    if (!requiresWebGPU || !checkLiquidGlassSync().supported) return;

    let isMounted = true;
    checkLiquidGlassAsync().then((support) => {
      if (isMounted) {
        setAsyncSupport(support);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [requiresWebGPU]);

  if (!requiresWebGPU) {
    return { isSupported: true, isChecking: false, unsupportedReason: null };
  }

  const syncSupport = checkLiquidGlassSync();
  if (!syncSupport.supported) {
    return {
      isSupported: false,
      isChecking: false,
      unsupportedReason: syncSupport.reason,
    };
  }

  return {
    isSupported: asyncSupport?.supported === true,
    isChecking: asyncSupport === null,
    unsupportedReason: asyncSupport?.reason ?? null,
  };
}

/**
 * Keeps Liquid DOM's GPU canvas and authored fallback in one reliable state.
 * A paint timeout catches asynchronous renderer failures that LiquidCanvas's
 * frame-level onError callback cannot always observe during initialization.
 */
export function useLiquidGlassRenderer({
  enabled,
  onError,
  readyKey = true,
  paintTimeout = 4000,
}) {
  const liquidRef = useRef(null);
  const [hasPainted, setHasPainted] = useState(false);
  const [hasRuntimeError, setHasRuntimeError] = useState(false);
  const hasReportedError = useRef(false);
  const liquidEnabled = enabled && !hasRuntimeError;

  const reportError = useCallback((error) => {
    if (hasReportedError.current) return;
    hasReportedError.current = true;
    setHasRuntimeError(true);
    setHasPainted(false);
    onError?.(error);
  }, [onError]);

  useLayoutEffect(() => {
    if (!liquidEnabled || !readyKey) return undefined;

    const canvas = liquidRef.current?.canvas;
    if (!canvas) return undefined;

    let timeoutId;
    const handlePaint = () => {
      clearTimeout(timeoutId);
      setHasPainted(true);
    };

    canvas.addEventListener('paint', handlePaint, { once: true });
    canvas.requestPaint?.();
    liquidRef.current?.invalidateFrame();
    timeoutId = setTimeout(() => {
      reportError(new Error('Liquid DOM did not produce a paint event.'));
    }, paintTimeout);

    return () => {
      clearTimeout(timeoutId);
      canvas.removeEventListener('paint', handlePaint);
    };
  }, [liquidEnabled, paintTimeout, readyKey, reportError]);

  return {
    liquidRef,
    liquidEnabled,
    hasPainted,
    showFallback: !liquidEnabled || !hasPainted,
    reportError,
  };
}
