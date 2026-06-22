import { useState } from 'react';
import CodeIcon from './CodeIcon';

export default function Card({ data }) {
  const { Component, props, code, controls = true } = data;
  const [isSlowMotion, setIsSlowMotion] = useState(false);
  const component = Component && <Component data={props} isSlowMotion={isSlowMotion} />;

  return (
    <div className={`design-card ${controls ? '' : 'widget-card'}`.trim()}>
      {controls ? component : <div className="widget-preview">{component}</div>}
      {controls && <button
        className={`slow-motion-toggle ${isSlowMotion ? 'active' : ''}`}
        onClick={() => setIsSlowMotion(!isSlowMotion)}
        title="Toggle Slow Motion"
      >
        {isSlowMotion ? '0.1x' : '1x'}
      </button>}
      {controls && code && <CodeIcon code={code} />}
    </div>
  );
}
