import {
  Frame,
  Glass,
  GlassContainer,
  Html,
  Transform,
  ZStack,
  easing,
} from '@liquid-dom/react';
import {
  PRESS_EASE,
  PRESS_PEAK_DURATION_MS,
  PRESS_RELEASE_DURATION_MS,
  PRESS_RESET_DURATION_MS,
  PRESS_SETTLE_DURATION_MS,
} from '../../utils/liquidGlassMotion';

const GLASS_BEZEL_WIDTH = 12;
const GLASS_THICKNESS = 32;
const GLASS_BLUR = 4;
const GLASS_DISPLACEMENT = 0.55;
const SHADOW_SOURCE_PAD = 24;

const pressTransitions = {
  peak: easing({ duration: PRESS_PEAK_DURATION_MS / 1000, ease: PRESS_EASE }),
  reset: easing({ duration: PRESS_RESET_DURATION_MS / 1000, ease: PRESS_EASE }),
  settle: easing({ duration: PRESS_SETTLE_DURATION_MS / 1000, ease: PRESS_EASE }),
  release: easing({ duration: PRESS_RELEASE_DURATION_MS / 1000, ease: PRESS_EASE }),
};

export default function LiquidGlassControl({
  x,
  y,
  width,
  height,
  renderScale,
  pressScale = 1,
  pressPhase = 'release',
  pressTransitionEnabled = true,
  dragTransform = null,
  shadowSourceClassName = null,
  reducedMotion = false,
  cornerRadius = height / 2,
  cornerSmoothing = 0,
}) {
  const pressTransition = reducedMotion || !pressTransitionEnabled
    ? false
    : pressTransitions[pressPhase] ?? pressTransitions.peak;
  const dragScaleX = dragTransform?.scaleX ?? 1;
  const dragScaleY = dragTransform?.scaleY ?? 1;
  const dragTranslateX = dragTransform?.translateX ?? 0;
  const dragTranslateY = dragTransform?.translateY ?? 0;
  const dragOrigin = {
    x: dragTransform?.originX ?? 0.5,
    y: dragTransform?.originY ?? 0.5,
  };

  return (
    <Transform
      x={x * renderScale}
      y={y * renderScale}
      origin={{ x: 0.5, y: 0.5 }}
      scaleX={pressScale}
      scaleY={pressScale}
      transition={{ scaleX: pressTransition, scaleY: pressTransition }}
    >
      <ZStack alignment="topLeading">
        {shadowSourceClassName && (
          <Frame
            width={width * renderScale}
            height={height * renderScale}
            alignment="topLeading"
          >
            <Transform
              x={dragTranslateX * renderScale}
              y={dragTranslateY * renderScale}
              origin={dragOrigin}
              scaleX={dragScaleX}
              scaleY={dragScaleY}
              transition={false}
            >
              <Frame
                width={width * renderScale}
                height={height * renderScale}
                alignment="topLeading"
              >
                <Transform
                  x={-SHADOW_SOURCE_PAD * renderScale}
                  y={-SHADOW_SOURCE_PAD * renderScale}
                >
                  <Html sizing="intrinsic" zIndex={-1}>
                    <div
                      className={shadowSourceClassName}
                      style={{
                        width: (width + SHADOW_SOURCE_PAD * 2) * renderScale,
                        height: (height + SHADOW_SOURCE_PAD * 2) * renderScale,
                        '--liquid-shadow-pad': `${SHADOW_SOURCE_PAD * renderScale}px`,
                      }}
                      aria-hidden="true"
                    />
                  </Html>
                </Transform>
              </Frame>
            </Transform>
          </Frame>
        )}
        <Transform
          x={dragTranslateX * renderScale}
          y={dragTranslateY * renderScale}
          origin={dragOrigin}
          scaleX={dragScaleX}
          scaleY={dragScaleY}
          transition={false}
        >
          <GlassContainer
            blur={GLASS_BLUR * renderScale}
            bezelWidth={GLASS_BEZEL_WIDTH * renderScale}
            thickness={GLASS_THICKNESS * renderScale}
            displacementFactor={GLASS_DISPLACEMENT}
            displacementBlur={1 * renderScale}
            dispersion={0}
            lightDirection={-Math.PI / 4}
            specularStrength={0.75}
            specularWidth="hairline"
            oppositeSpecularStrength={0.4}
            specularOpacity={0.62}
            reflectionOffset={8 * renderScale}
            tint={{ r: 1, g: 1, b: 1, a: 0.08 }}
            shadowColor={{ r: 0, g: 0, b: 0, a: 0.04 }}
            shadowOffsetY={4 * renderScale}
            shadowBlur={14 * renderScale}
            zIndex={1}
          >
            <Frame width={width * renderScale} height={height * renderScale}>
              <Glass
                cornerRadius={cornerRadius * renderScale}
                cornerSmoothing={cornerSmoothing}
              />
            </Frame>
          </GlassContainer>
        </Transform>
      </ZStack>
    </Transform>
  );
}
