import './RadioWidget.css';

export default function RadioWidget() {
  return (
    <div className="widget radio-widget">
      <div className="radio-display">
        <div className="radio-ticks" />
        <i className="needle" />
        <strong><small>FM</small>97.2</strong>
        <span>96.0KHz · 24bit</span>
      </div>
      <p>Como Radio</p>
      <div className="radio-actions">
        <button aria-label="Previous station"><i className="iconfont icon-skip-back" /></button>
        <button aria-label="Next station"><i className="iconfont icon-skip-forward" /></button>
        <button className="power" aria-label="Power"><i className="iconfont icon-power-01" /></button>
      </div>
    </div>
  );
}
