import './StockWidget.css';

export default function StockWidget() {
  return (
    <div className="widget stock-widget">
      <div className="stock-head">
        <strong>7.860<span><i className="iconfont icon-arrow-narrow-up-right" /></span></strong>
        <b>+0.170 +2.21%</b>
        <small>Market Closed</small>
      </div>
      <svg viewBox="0 0 240 90" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 60 L15 42 L26 70 L50 64 L60 78 L76 77 L83 58 L100 66 L111 48 L120 56 L121 30 L135 45 L144 24 L157 38 L168 12 L181 15 L194 35 L202 7 L222 22" />
      </svg>
      <p>Figma,IncClassA FIG.N</p>
      <i className="spark iconfont icon-star-05"></i>
    </div>
  );
}
