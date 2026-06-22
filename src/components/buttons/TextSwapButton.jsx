import { useState, useRef, useEffect } from 'react';
import styles from './TextSwapButton.module.css';
import baseStyles from './BaseButton.module.css';

const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
const EASE_OUT = 'cubic-bezier(0.0, 0.0, 0.2, 1)';

function measureTextWidth(text, fontSize = 17) {
  const span = document.createElement('span');
  span.style.cssText =
    `font-size:${fontSize}px;font-weight:600;white-space:nowrap;position:absolute;visibility:hidden;font-family: var(--font-main);`;
  span.textContent = text;
  document.body.appendChild(span);
  const w = span.getBoundingClientRect().width;
  span.remove();
  return w;
}

function setChars(el, text) {
  el.innerHTML = '<span style="visibility: hidden">&nbsp;</span>';
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; white-space: nowrap;';

  [...text].forEach((ch) => {
    const span = document.createElement('span');
    let className = `${styles.char} ${styles.visible}`;
    if (ch >= '\ue000' && ch <= '\uf8ff') {
      className += ' iconfont';
    }
    span.className = className;
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    wrapper.appendChild(span);
  });
  el.appendChild(wrapper);
}

export default function TextSwapButton({ data, isSlowMotion }) {
  const {
    disabled = false,
    defaultText = 'Get Started',
    hoverText = 'Let\'s Go \ue6bc',
  } = data || {};

  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [btnWidth, setBtnWidth] = useState(null);

  const btnRef = useRef(null);
  const animatingRef = useRef(false);
  const pendingRef = useRef(null);
  const currentTextRef = useRef(defaultText);

  useEffect(() => {
    if (!hoverText) return;
    const w1 = measureTextWidth(defaultText, 17);
    const w2 = measureTextWidth(hoverText, 17);
    setBtnWidth(Math.ceil(Math.max(w1, w2)) + 88);
  }, [defaultText, hoverText]);

  useEffect(() => {
    if (!btnRef.current) return;
    setChars(btnRef.current, defaultText);
  }, [defaultText]);

  const animateSwap = (newTextArr) => {
    const el = btnRef.current;
    if (!el) return;

    const newTextStr = newTextArr.join('');

    if (animatingRef.current) {
      if (newTextStr !== currentTextRef.current) {
        pendingRef.current = newTextArr;
      } else {
        pendingRef.current = null;
      }
      return;
    }

    if (newTextStr === currentTextRef.current) return;

    animatingRef.current = true;
    pendingRef.current = null;
    currentTextRef.current = newTextStr;

    const isLeaving = newTextStr === defaultText;
    const speedMultiplier = isSlowMotion ? 10 : 1;
    const durationNum = (isLeaving ? 0.16 : 0.16) * speedMultiplier;
    const duration = `${durationNum}s`;
    const stagger = (isLeaving ? 0 : 0.018) * speedMultiplier;
    const transitionPaddingMs = 120 * speedMultiplier;

    // Find CURRENT wrapper
    const wrappers = el.querySelectorAll('div');
    const oldWrapper = wrappers[wrappers.length - 1];

    // Create NEW wrapper
    const newWrapper = document.createElement('div');
    newWrapper.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; white-space: nowrap;';

    newTextArr.forEach((ch) => {
      const span = document.createElement('span');
      let className = `${styles.char} ${styles.flyIn}`;
      if (ch >= '\ue000' && ch <= '\uf8ff') {
        className += ' iconfont';
      }
      span.className = className;
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      newWrapper.appendChild(span);
    });

    el.appendChild(newWrapper);

    // Force layout reflow
    void el.offsetHeight;

    // 1. Old wrapper fly out
    if (oldWrapper) {
      const oldChars = [...oldWrapper.children];
      oldChars.forEach((char, i) => {
        char.style.transition =
          `transform ${duration} ${EASE_IN}, opacity ${duration} linear, filter ${duration} ease`;
        char.style.transitionDelay = `${i * stagger}s`;
        char.classList.add(styles.flyOut);
        char.classList.remove(styles.visible);
      });

      const oldOutTime = durationNum * 1000 + (oldChars.length - 1) * stagger * 1000;
      setTimeout(() => {
        if (el.contains(oldWrapper)) el.removeChild(oldWrapper);
      }, oldOutTime + 50);
    }

    // 2. New wrapper fly in
    const flyInDelay = isLeaving ? 0 : 100 * speedMultiplier;
    const newChars = [...newWrapper.children];
    newChars.forEach((char, i) => {
      char.style.transition =
        `transform ${duration} ${EASE_OUT}, opacity ${duration} linear, filter ${duration} ease`;
      char.style.transitionDelay = `${(flyInDelay / 1000) + i * stagger}s`;
      char.classList.remove(styles.flyIn);
      char.classList.add(styles.visible);
    });

    // 3. Release lock
    const newInTime = flyInDelay + durationNum * 1000 + (newChars.length - 1) * stagger * 1000;
    const oldOutTime = oldWrapper ? (durationNum * 1000 + (oldWrapper.children.length - 1) * stagger * 1000) : 0;
    const totalMs = Math.max(newInTime, oldOutTime) + transitionPaddingMs;

    const doneTimer = setTimeout(() => {
      animatingRef.current = false;
      if (pendingRef.current) animateSwap(pendingRef.current);
    }, totalMs);

    return { doneTimer };
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hoverText) {
      animateSwap([...hoverText]);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    if (defaultText) {
      animateSwap([...defaultText]);
    }
  };

  let className = `${baseStyles.button} ${styles.button}`;
  if (isPressed && !disabled) {
    className += ` ${styles.buttonPressed}`;
  } else if (isHovered && !disabled) {
    className += ` ${styles.buttonHovered}`;
  }

  if (isSlowMotion) {
    className += ` ${styles.slowMotion}`;
  }

  if (disabled) {
    className += ' is-disabled';
  }

  return (
    <div
      style={{ display: 'inline-flex' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      <button
        ref={btnRef}
        className={className}
        style={btnWidth ? { width: `${btnWidth}px` } : undefined}
        disabled={disabled}
      />
    </div>
  );
}
