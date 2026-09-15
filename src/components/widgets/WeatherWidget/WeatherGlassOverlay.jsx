import { forwardRef, useEffect, useImperativeHandle } from 'react';
import {
  Frame,
  Glass,
  GlassContainer,
  Html,
  LiquidCanvas,
  ZStack,
} from '@liquid-dom/react';
import {
  checkCornerShapeSupport,
  useLiquidGlassRenderer,
} from '../../../utils/compatibility';

const GLASS_SIZE = 212;
const GLASS_RADIUS = 27;
const SUPPORTS_CORNER_SHAPE = checkCornerShapeSupport();
const GLASS_CORNER_RADIUS = GLASS_RADIUS * (SUPPORTS_CORNER_SHAPE ? 1 : 2 / 3);
const GLASS_CORNER_SMOOTHING = SUPPORTS_CORNER_SHAPE ? 0.6 : 0;

const WeatherGlassOverlay = forwardRef(function WeatherGlassOverlay(
  { children, details = false, isWebGPUSupported = true, onCompatibilityError },
  ref,
) {
  const supportsLiquidDom = isWebGPUSupported
    && typeof navigator !== 'undefined'
    && Boolean(navigator.gpu);
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
  const liquidReady = hasPainted;
  const renderScale = 0.5;
  const renderSize = GLASS_SIZE * renderScale;

  useImperativeHandle(ref, () => ({
    invalidateFrame: () => liquidRef.current?.invalidateFrame(),
  }), [liquidRef]);

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
    if (!liquidEnabled) return;

    liquidRef.current?.invalidateLayout();
    liquidRef.current?.invalidateFrame();
  }, [liquidEnabled, liquidRef]);

  return (
    <>
      {showFallback && children}
      {showFallback && <div className="weather-widget-glass-fallback" aria-hidden="true" />}

      {liquidEnabled && (
        <LiquidCanvas
          ref={liquidRef}
          className={`weather-widget-liquid${liquidReady ? ' weather-widget-liquid--ready' : ''}`}
          style={{ width: GLASS_SIZE, height: GLASS_SIZE }}
          canvasClassName="weather-widget-liquid-canvas"
          proposal={{ width: renderSize, height: renderSize }}
          maxDpr={2}
          frameloop={liquidReady ? 'demand' : 'always'}
          onError={reportError}
        >
          <ZStack>
            <GlassContainer
              blur={0}
              thickness={0}
              displacementFactor={0}
              displacementBlur={0}
              dispersion={0}
              specularStrength={0}
              oppositeSpecularStrength={0}
              specularOpacity={0}
              tint={{ r: 1, g: 1, b: 1, a: 0 }}
              shadowColor={{ r: 0, g: 0, b: 0, a: 0 }}
              zIndex={1}
            >
              <Frame width={renderSize} height={renderSize}>
                <Glass cornerRadius={GLASS_CORNER_RADIUS * renderScale} cornerSmoothing={GLASS_CORNER_SMOOTHING}>
                  <Html sizing="fill" zIndex={0}>
                    <div
                      className={`weather-widget-liquid-source${details ? ' weather-widget-liquid-source--details' : ''}`}
                      style={{
                        width: GLASS_SIZE,
                        height: GLASS_SIZE,
                        transform: `scale(${renderScale})`,
                        transformOrigin: 'top left',
                      }}
                      aria-hidden="true"
                      onLoadCapture={() => liquidRef.current?.invalidateFrame()}
                    >
                      {children}
                    </div>
                  </Html>
                </Glass>
              </Frame>
            </GlassContainer>

            <GlassContainer
              blur={0}
              thickness={40 * renderScale}
              displacementFactor={0.6}
              displacementBlur={0}
              dispersion={1}
              lightDirection={-Math.PI / 4}
              specularStrength={0.7}
              specularWidth={2 * renderScale}
              oppositeSpecularStrength={0.7}
              specularOpacity={0.7}
              tint={{ r: 1, g: 1, b: 1, a: 0.1 }}
              shadowColor={{ r: 0, g: 0, b: 0, a: 0 }}
              zIndex={2}
            >
              <Frame width={renderSize} height={renderSize}>
                <Glass cornerRadius={GLASS_CORNER_RADIUS * renderScale} cornerSmoothing={GLASS_CORNER_SMOOTHING} />
              </Frame>
            </GlassContainer>
          </ZStack>
        </LiquidCanvas>
      )}
    </>
  );
});

export default WeatherGlassOverlay;
