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
    code: `/* Focus Aurora — Award Mesh Gradient */
<MeshGradient
  colors={['#7f9fff', '#9eaaf2', '#d7d4e6', '#f0edf1', '#e2dce7', '#cbc3d4']}
  distortion={0.68}
  frame={3700}
  rotation={197}
  speed={1}
  swirl={0.16}
  maxPixelCount={10000}
  minPixelRatio={1}
/>`,
  },
];

export default shaderData;
