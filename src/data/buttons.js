/**
 * Button exploration data.
 * 变体 2 — 文字切换交错动画（最接近原文效果）
 */

import TextSwapButton from '../components/buttons/TextSwapButton';
import LiquidGlassButton from '../components/buttons/LiquidGlassButton';
import NextSongCDButton from '../components/buttons/NextSongCDButton';
import liquidGlassBackground from '../assets/liquid-glass-mountain.jpg';

const buttonData = [
  {
    id: 'btn-text-swap',
    label: 'Text Swap',
    category: 'components',
    tags: ['interaction', 'motion', 'button', 'hover'],
    Component: TextSwapButton,
    props: {
      variant: 'text-swap',
      defaultText: 'Button',
      hoverText: "Button \ue6bc",
    },
    code: `/* 文字拆分 + 交错飞出弹入 */
.btn .char {
  display: inline-block;
  white-space: pre;
}
/* 飞出：向上 + blur + 消失 */
.char.fly-out {
  transform: translateY(-20px);
  opacity: 0;
  filter: blur(4px);
}
/* 弹入：从下弹回 */
.char.fly-in {
  transform: translateY(20px);
  opacity: 0;
  filter: blur(4px);
}
.char.visible {
  transform: translateY(0);
  opacity: 1;
  filter: blur(0px);
    }`,
  },
  {
    id: 'btn-next-song-cd',
    label: 'Next Song — CD',
    category: 'components',
    tags: ['interaction', 'visual', 'button', 'pressed'],
    Component: NextSongCDButton,
    props: {
      label: 'Button',
    },
    code: `/* 拟物 CD 播放器的 Next Song 按钮 */
.button:active {
  filter: brightness(.92);
}

.button:active::after {
  opacity: 1;
}

.button:active .label {
  transform: scale(.98);
}

.shell:has(.button:active) .button::before,
.shell:has(.button:active) .button::after {
  inset: 7px;
}

.button {
  width: 156px;
  height: 48px;
  border-radius: 10px;
  corner-shape: superellipse(1.35);
  padding: 6px;
}

@supports (corner-shape: squircle) and (corner-shape: superellipse(1.35)) {
  .button { border-radius: 20px; }
}

.shell {
  width: 156px;
  height: 48px;
  padding: 0;
  background: #000;
}`,
  },
  {
    id: 'btn-liquid-glass',
    label: 'Liquid Glass',
    category: 'components',
    tags: ['interaction', 'motion', 'visual', 'button', 'hover'],
    Component: LiquidGlassButton,
    requiresWebGPU: true,
    cardBackgroundImage: liquidGlassBackground,
    code: `/* Next Song 风格的 Liquid DOM 玻璃按钮 */
const supportsCornerShape = CSS.supports('corner-shape: squircle')
  && CSS.supports('corner-shape: superellipse(1.35)');

<LiquidCanvas frameloop="demand">
  <ControlGlass
    width={156}
    height={48}
    cornerRadius={20 * (supportsCornerShape ? 1 : 1 / 2)}
    cornerSmoothing={supportsCornerShape ? 0.165 : 0}
    pressScale={pressed ? pressScale : 1}
    dragTransform={pressDrag}
  />
</LiquidCanvas>

.button {
  width: 156px;
  height: 48px;
  border-radius: 10px;
  corner-shape: superellipse(1.35);
  background: transparent;
  touch-action: none;
}

@supports (corner-shape: squircle) and (corner-shape: superellipse(1.35)) {
  .button { border-radius: 20px; }
}
.button:hover .hoverHighlight { opacity: 1; }

const PRESS_PEAK_SCALE = 1.15;
const PRESS_REST_SCALE = 1.1;`,
  },
];

export default buttonData;
