import { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import CodeIcon from './CodeIcon';

const EXPAND = '\ue6c6';
const CLOSE = '\ue6b0';

export default function Card({ data }) {
  const { Component, props, code, controls = true } = data;
  const [isSlowMotion, setIsSlowMotion] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandRect, setExpandRect] = useState(null);
  const cardRef = useRef(null);

  const handleExpand = () => {
    if (cardRef.current) {
      setExpandRect(cardRef.current.getBoundingClientRect());
      setIsExpanded(true);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setExpandRect(null);
  };

  const component = Component && <Component data={props} isSlowMotion={isSlowMotion} />;

  const cardContent = (
    <div 
      ref={cardRef}
      className={`design-card ${controls ? '' : 'widget-card'}`.trim()}
      style={{ opacity: isExpanded ? 0 : 1 }}
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
      {cardContent}
      {isExpanded && !controls && createPortal(
        <ExpandedModal 
          component={component} 
          onClose={handleClose} 
          rect={expandRect} 
        />,
        document.body
      )}
    </>
  );
}

function ExpandedModal({ component, onClose, rect }) {
  const [animating, setAnimating] = useState(false);
  const [closing, setClosing] = useState(false);

  useLayoutEffect(() => {
    // Trigger the enter animation after the initial frame paints
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
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 400); // Wait for FLIP exit animation to finish
  };

  let transformStyle = {};
  if (rect) {
    // Calculate the distance from original card to screen center
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const origX = rect.left + rect.width / 2;
    const origY = rect.top + rect.height / 2;
    
    const deltaX = origX - centerX;
    const deltaY = origY - centerY;

    if (!animating || closing) {
      // Initial or Closing state: shrink back to original position
      transformStyle = {
        transform: `translate(${deltaX}px, ${deltaY}px) scale(0.5)`,
        borderRadius: '56px' // Needs to look like 28px when scaled by 0.5
      };
    } else {
      // Expanded state: center and full size
      transformStyle = {
        transform: `translate(0, 0) scale(1)`,
        borderRadius: '48px'
      };
    }
  }

  return (
    <div 
      className={`widget-modal-overlay ${animating && !closing ? 'open' : ''}`} 
      onClick={handleClose}
    >
      <div className="widget-modal-content" onClick={(e) => e.stopPropagation()}>
        <div 
          className="design-card widget-card expanded-card"
          style={{
            ...transformStyle,
            transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), border-radius 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        >
          <div className="widget-preview">{component}</div>
        </div>
        <button
          className="widget-modal-close"
          style={{
             opacity: animating && !closing ? 1 : 0,
             transition: 'opacity 0.2s 0.2s',
             pointerEvents: animating && !closing ? 'auto' : 'none'
          }}
          onClick={handleClose}
          title="Close"
        >
          <i className="iconfont" style={{ fontSize: 20 }}>{CLOSE}</i>
        </button>
      </div>
    </div>
  );
}
