import { useState } from 'react';
import CodeIcon from './CodeIcon';

export default function Card({ data }) {
  const { Component, props, code } = data;
  const [isSlowMotion, setIsSlowMotion] = useState(false);

  return (
    <div className="design-card">
      {Component && <Component data={props} isSlowMotion={isSlowMotion} />}
      <button 
        className={`slow-motion-toggle ${isSlowMotion ? 'active' : ''}`}
        onClick={() => setIsSlowMotion(!isSlowMotion)}
        title="Toggle Slow Motion"
      >
        {isSlowMotion ? '0.1x' : '1x'}
      </button>
      <CodeIcon code={code} />
    </div>
  );
}
