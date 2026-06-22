import './NextSongWidget.css';

export default function NextSongWidget() {
  return (
    <div className="widget next-widget">
      <div className="disc" aria-hidden="true"><i /><b /></div>
      <div className="player-bar">
        <button aria-label="Play next song">▶</button>
        <span>Next Song</span>
      </div>
    </div>
  );
}
