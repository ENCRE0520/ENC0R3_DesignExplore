import { useCallback, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWebGPUSupport } from '../utils/compatibility';

const EXPAND = '\ue6c6';
const CLOSE = '\ue6b0';

function WarningIcon() {
  return (
    <svg
      className="card-warning-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="7.5" x2="12" y2="12.5" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Card({ data }) {
  const { Component, props, controls = true, layout } = data;
  const isWideWidget = !controls && layout === 'wide';
  const [isSlowMotion, setIsSlowMotion] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasExpanded, setHasExpanded] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [closing, setClosing] = useState(false);
  const [expandRect, setExpandRect] = useState(null);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const cardRef = useRef(null);
  const hasCardBackground = Boolean(data.cardBackgroundImage);

  const requiresWebGPU = Boolean(data.requiresWebGPU);
  const {
    isSupported: isWebGPUSupported,
    isChecking: isCheckingWebGPU,
    unsupportedReason,
  } = useWebGPUSupport(requiresWebGPU);
  const [hasRuntimeError, setHasRuntimeError] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const hasWebGPUIssue = requiresWebGPU && (hasRuntimeError || (!isCheckingWebGPU && !isWebGPUSupported));
  const hasCompatibilityIssue = hasWebGPUIssue;
  const warningMessage = hasRuntimeError
    ? 'Liquid Glass 渲染失败，已切换为静态样式。'
    : unsupportedReason === 'html-in-canvas'
      ? '浏览器不支持 Liquid Glass 依赖所需的 HTML-in-Canvas API，已切换为静态样式。'
      : '浏览器不支持 Liquid Glass 依赖（WebGPU 不可用），已切换为静态样式。';
  const handleCompatibilityError = useCallback(() => {
    setHasRuntimeError(true);
  }, []);

  const handleExpand = () => {
    if (cardRef.current) {
      setHasExpanded(true);
      setExpandRect(cardRef.current.getBoundingClientRect());
      setIsExpanded(true);
      setAnimating(false);
      setClosing(false);
    }
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setIsExpanded(false);
      setExpandRect(null);
    }, 400); // Wait for FLIP exit animation to finish
  };

  useLayoutEffect(() => {
    if (isExpanded && !closing && expandRect) {
      let raf2;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setAnimating(true);
        });
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    }
  }, [isExpanded, closing, expandRect]);

  const component = Component && (
    <Component
      data={props}
      isSlowMotion={isSlowMotion}
      isExpanded={isExpanded}
      parallaxBoundaryRef={cardRef}
      isCardHovered={isCardHovered}
      cardBackgroundImage={data.cardBackgroundImage}
      isWebGPUSupported={isWebGPUSupported}
      onCompatibilityError={handleCompatibilityError}
    />
  );

  let fixedStyle = {};
  let expandedWidth = 0;
  let expandedHeight = 0;
  if (isExpanded && expandRect) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const origX = expandRect.left + expandRect.width / 2;
    const origY = expandRect.top + expandRect.height / 2;
    const viewportPadding = 32;
    const expandedScale = Math.min(
      2,
      (window.innerWidth - viewportPadding) / expandRect.width,
      (window.innerHeight - viewportPadding) / expandRect.height,
    );
    expandedWidth = expandRect.width * expandedScale;
    expandedHeight = expandRect.height * expandedScale;

    const deltaX = centerX - origX;
    const deltaY = centerY - origY;

    if (!animating || closing) {
      fixedStyle = {
        position: 'fixed',
        top: expandRect.top,
        left: expandRect.left,
        width: expandRect.width,
        height: expandRect.height,
        zIndex: 1001,
        margin: 0,
        animation: 'none',
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.4s ease',
        transform: 'translate(0px, 0px) scale(1)',
        transformOrigin: 'center center',
        backgroundColor: 'var(--card-bg)',
      };
    } else {
      fixedStyle = {
        position: 'fixed',
        top: expandRect.top,
        left: expandRect.left,
        width: expandRect.width,
        height: expandRect.height,
        zIndex: 1001,
        margin: 0,
        animation: 'none',
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.4s ease',
        transform: `translate(${deltaX}px, ${deltaY}px) scale(${expandedScale})`,
        transformOrigin: 'center center',
        backgroundColor: 'transparent',
      };
    }
  }

  const isShaderCard = data.category === 'shaders';
  const cardClassName = [
    'design-card',
    !controls && 'widget-card',
    isWideWidget && 'wide-widget-card',
    isExpanded && 'is-expanded',
    hasCardBackground && 'design-card--image-hover',
    isShaderCard && 'design-card--shader',
  ].filter(Boolean).join(' ');
  const cardStyle = {
    ...(isExpanded ? fixedStyle : (hasExpanded ? { animation: 'none' } : {})),
    ...(hasCardBackground ? { '--card-background-image': `url(${data.cardBackgroundImage})` } : {}),
  };

  const cardNode = (
    <div 
      key="original"
      ref={cardRef}
      className={cardClassName}
      style={cardStyle}
      onPointerEnter={(event) => {
        if (hasCardBackground && event.pointerType === 'mouse') setIsCardHovered(true);
      }}
      onPointerLeave={(event) => {
        if (hasCardBackground && event.pointerType === 'mouse') setIsCardHovered(false);
      }}
    >
      {hasCardBackground && <div className="card-background-image" aria-hidden="true" />}
      {controls ? component : <div className="widget-preview">{component}</div>}
      
      {controls && (data.showSlowMotion ?? !isShaderCard) && <button
        type="button"
        className={`slow-motion-toggle ${isSlowMotion ? 'active' : ''}`}
        onClick={() => setIsSlowMotion(!isSlowMotion)}
        title="Toggle Slow Motion"
        aria-label="Toggle slow motion"
        aria-pressed={isSlowMotion}
      >
        {isSlowMotion ? '0.1x' : '1x'}
      </button>}
      {!controls && !isExpanded && (
        <button
          type="button"
          className="widget-expand-trigger"
          onClick={handleExpand}
          title="Expand"
          aria-label={`Expand ${data.label || 'widget'}`}
        >
          <i className="iconfont" style={{ fontSize: 16 }}>{EXPAND}</i>
        </button>
      )}

      {hasCompatibilityIssue && (
        <button
          type="button"
          className={`card-compatibility-warning${isTooltipOpen ? ' is-active' : ''}`}
          aria-label={warningMessage}
          aria-expanded={isTooltipOpen}
          onClick={(e) => {
            e.stopPropagation();
            setIsTooltipOpen((prev) => !prev);
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === 'mouse') setIsTooltipOpen(false);
          }}
          onBlur={() => setIsTooltipOpen(false)}
        >
          <span className="card-warning-icon-wrapper" aria-hidden="true">
            <WarningIcon />
          </span>
          <span className="card-warning-text">{warningMessage}</span>
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Placeholder to keep the grid layout intact when the card flies out */}
      {isExpanded && !controls && (
        <div key="placeholder" className={`design-card widget-card ${isWideWidget ? 'wide-widget-card' : ''}`} style={{ visibility: 'hidden' }} />
      )}
      
      {cardNode}
      
      {/* Portal the overlay and close button to ensure they are on top and not affected by scaling */}
      {isExpanded && !controls && createPortal(
        <>
          <div 
            className={`widget-modal-overlay ${animating && !closing ? 'open' : ''}`} 
            onClick={handleClose}
            style={{ zIndex: 1000 }}
          />
          <button
            type="button"
            className="widget-modal-close"
            style={{
               position: 'fixed',
               top: `calc(50% - ${expandedHeight / 2}px + 24px)`,
               right: `calc(50% - ${expandedWidth / 2}px + 24px)`,
               zIndex: 1002,
               opacity: animating && !closing ? 1 : 0,
               transition: 'opacity 0.2s 0.2s',
               pointerEvents: animating && !closing ? 'auto' : 'none'
            }}
            onClick={handleClose}
            title="Close"
            aria-label={`Close ${data.label || 'widget'}`}
          >
            <i className="iconfont" style={{ fontSize: 20 }}>{CLOSE}</i>
          </button>
        </>,
        document.body
      )}
    </>
  );
}
