/**
 * Button exploration data.
 * 变体 2 — 文字切换交错动画（最接近原文效果）
 */

import TextSwapButton from '../components/buttons/TextSwapButton';

const buttonData = [
  {
    id: 'btn-text-swap',
    label: 'Text Swap',
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
];

export default buttonData;
