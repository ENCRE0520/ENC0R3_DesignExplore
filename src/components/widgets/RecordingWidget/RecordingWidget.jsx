import './RecordingWidget.css';

const wave = [
  26, 36, 48, 66, 82, 96, 74, 90, 110, 92,
  74, 58, 46, 38, 32, 30, 30, 34, 48, 66,
  92, 116, 98, 82, 114, 94, 72, 108, 126,
];

export default function RecordingWidget() {
  return (
    <div className="widget recording-widget">
      <div className="waveform" aria-hidden="true">
        {wave.map((height, index) => (
          <i
            key={`${height}-${index}`}
            style={{ height }}
            className={index === wave.length - 1 ? 'playhead' : ''}
          />
        ))}
      </div>
      <div className="record-meta">
        <span><b /> recording</span>
        <strong>00:05:20</strong>
      </div>
      <button className="record-pause" aria-label="Pause recording">
        <i className="iconfont icon-pause-square" />
      </button>
      <button className="record-stop" aria-label="Stop recording">
        <i className="iconfont icon-stop" />
      </button>
    </div>
  );
}
