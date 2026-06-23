import { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import CodeIcon from './CodeIcon';

const EXPAND = '\ue6c6';
const CLOSE = '\ue6b0';

export default function Card({ data }) {
  const { Component, props, code, controls = true } = data;
  const [isSlowMotion, setIsSlowMotion] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasExpanded, setHasExpanded] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [closing, setClosing] = useState(false);
  const [expandRect, setExpandRect] = useState(null);
  const cardRef = useRef(null);

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

  const component = Component && <Component data={props} isSlowMotion={isSlowMotion} />;

  let fixedStyle = {};
  if (isExpanded && expandRect) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const origX = expandRect.left + expandRect.width / 2;
    const origY = expandRect.top + expandRect.height / 2;
    
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
        transform: `translate(${deltaX}px, ${deltaY}px) scale(2)`,
        transformOrigin: 'center center',
        backgroundColor: 'transparent',
      };
    }
  }

  const cardNode = (
    <div 
      key="original"
      ref={cardRef}
      className={`design-card ${controls ? '' : 'widget-card'}`.trim()}
      style={isExpanded ? fixedStyle : (hasExpanded ? { animation: 'none' } : {})}
    >
      {controls ? component : <div className="widget-preview">{component}</div>}
      
      {controls && <button
        className={`slow-motion-toggle ${isSlowMotion ? 'active' : ''}`}
        onClick={() => setIsSlowMotion(!isSlowMotion)}
        title="Toggle Slow Motion"
      >
        {isSlowMotion ? '0.1x' : '1x'}
      </button>}
      {controls && code && <CodeIcon code={code} />}
      {!controls && !isExpanded && (
        <button
          className="widget-expand-trigger"
          onClick={handleExpand}
          title="Expand"
        >
          <i className="iconfont" style={{ fontSize: 16 }}>{EXPAND}</i>
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Placeholder to keep the grid layout intact when the card flies out */}
      {isExpanded && !controls && (
        <div key="placeholder" className="design-card widget-card" style={{ visibility: 'hidden' }} />
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
            className="widget-modal-close"
            style={{
               position: 'fixed',
               top: 'calc(50% - 240px + 24px)',
               right: 'calc(50% - 240px + 24px)',
               zIndex: 1002,
               opacity: animating && !closing ? 1 : 0,
               transition: 'opacity 0.2s 0.2s',
               pointerEvents: animating && !closing ? 'auto' : 'none'
            }}
            onClick={handleClose}
            title="Close"
          >
            <i className="iconfont" style={{ fontSize: 20 }}>{CLOSE}</i>
          </button>
        </>,
        document.body
      )}
    </>
  );
}
