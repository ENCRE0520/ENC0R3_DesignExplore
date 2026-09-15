/**
 * Shader exploration data.
 * Dynamic gradient fluid and ambient field studies.
 */

import DynamicFieldShader from '../components/shaders/DynamicFieldShader';
import RelationshipFlowShader from '../components/shaders/RelationshipFlowShader';
import FocusAuroraShader from '../components/shaders/FocusAuroraShader';

const shaderData = [
  {
    id: 'shader-dynamic-field',
    label: 'Dynamic Field',
    category: 'shaders',
    showSlowMotion: false,
    tags: ['shader', 'motion', 'gradient', 'mesh', 'ripple'],
    Component: DynamicFieldShader,
    code: `/* Dynamic Gradient Field & Ripple Pulses */
.dynamicGradientField {
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 66%, #6048f4 0 14%, #735fff 28%, rgb(121 105 250 / 86%) 44%, rgb(171 181 255 / 72%) 61%, transparent 78%),
    radial-gradient(circle at 72% 34%, rgb(193 208 255 / 80%) 0 12%, transparent 48%);
  mask-image: radial-gradient(ellipse 58% 58% at center, #000 0 68%, rgb(0 0 0 / 92%) 80%, transparent 100%);
  filter: blur(7.2px);
  animation: dynamic-gradient-flow 11s cubic-bezier(0.37, 0.05, 0.63, 0.95) infinite;
}

.dynamicRipple {
  background: radial-gradient(circle, transparent 0 42%, rgb(82 53 255 / 84%) 50%, rgb(127 105 255 / 62%) 58%, rgb(188 199 255 / 26%) 70%, transparent 82%);
  mix-blend-mode: screen;
  animation: dynamic-ripple-out 4.6s linear infinite;
}`,
  },
  {
    id: 'shader-relationship-flow',
    label: 'Relationship Flow',
    category: 'shaders',
    showSlowMotion: false,
    tags: ['shader', 'motion', 'gradient', 'flow', 'linear'],
    Component: RelationshipFlowShader,
    code: `/* Relationship Gradient Flow */
.relationshipGradientFlow {
  background: linear-gradient(
    180deg,
    #160052 0%,
    #211178 17%,
    #3457c6 42%,
    #8bb2fa 70%,
    #cfe0ff 100%
  );
  filter: blur(2px);
  animation: relationship-gradient-flow 6.8s linear infinite alternate;
}

@keyframes relationship-gradient-flow {
  0% { transform: translate3d(0, -18%, 0); }
  100% { transform: translate3d(0, 18%, 0); }
}`,
  },
  {
    id: 'shader-focus-aurora',
    label: 'Focus Aurora',
    category: 'shaders',
    showSlowMotion: false,
    tags: ['shader', 'motion', 'ambient', 'aurora', 'organic'],
    Component: FocusAuroraShader,
    code: `/* Focus Aurora Flow */
.focusArtwork {
  background: linear-gradient(135deg, #7f9fff 0%, #9eaaf2 48%, #d7d4e6 100%);
}

.focusArtwork::before {
  border-radius: 52% 48% 44% 56% / 34% 46% 54% 66%;
  background: linear-gradient(145deg, #f0edf1 0%, #e2dce7 54%, #cbc3d4 100%);
  filter: blur(7.2px);
  animation: focus-curve-flow 14.5s linear infinite;
}

.focusArtwork::after {
  border-radius: 56% 44% 64% 36% / 40% 54% 46% 60%;
  background: radial-gradient(ellipse at 34% 26%, rgb(126 153 255 / 58%) 0%, rgb(170 177 239 / 38%) 38%, transparent 78%);
  filter: blur(12.8px);
  animation: focus-curve-light-flow 10.8s linear infinite;
}`,
  },
];

export default shaderData;
