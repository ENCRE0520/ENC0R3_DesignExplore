import { useState } from 'react';

/* copy-02 (\e67c) — code representation */
const CODE = '\ue67c';
/* x-close (\e6b0) */
const CLOSE = '\ue6b0';

export default function CodeIcon({ code, position = 'br' }) {
  const [showCode, setShowCode] = useState(false);

  const posMap = {
    br: { bottom: 8, right: 8 },
    bl: { bottom: 8, left: 8 },
    tr: { top: 8, right: 8 },
    tl: { top: 8, left: 8 },
  };

  return (
    <>
      <button
        className="code-icon-trigger"
        style={posMap[position]}
        onClick={(e) => {
          e.stopPropagation();
          setShowCode(!showCode);
        }}
      >
        <i className="iconfont" style={{ fontSize: 18 }}>{CODE}</i>
      </button>

      {showCode && (
        <div className="code-tooltip" onClick={(e) => e.stopPropagation()}>
          <pre><code>{code}</code></pre>
          <button
            className="code-close"
            onClick={(e) => {
              e.stopPropagation();
              setShowCode(false);
            }}
          >
            <i className="iconfont" style={{ fontSize: 14 }}>{CLOSE}</i>
          </button>
        </div>
      )}
    </>
  );
}
