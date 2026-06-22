import './MusicWidget.css';

export default function MusicWidget() {
  return <div className="widget music-widget">
    <div className="song"><strong>Until I Found You</strong><small>Daniel Caesar</small></div>
    <div className="music-controls">
      <button><i className="iconfont icon-skip-back" /></button>
      <button className="pause"><i className="iconfont icon-pause-square" /></button>
      <button><i className="iconfont icon-skip-forward" /></button>
    </div>
    <button className="note"><i className="iconfont icon-airpods" /></button>
  </div>;
}
