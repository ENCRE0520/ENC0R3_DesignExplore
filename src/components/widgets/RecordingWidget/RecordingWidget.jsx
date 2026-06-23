import { useEffect, useRef, useState } from 'react';
import './RecordingWidget.css';

const wave = [
  8, 14, 22, 12, 30, 46, 24, 58, 76, 42,
  94, 64, 34, 18, 28, 52, 86, 118, 72, 44,
  26, 16, 38, 68, 104, 82, 124, 92, 56, 32,
  20, 12, 24, 48, 78, 110, 66, 36, 54, 88,
  128, 96, 62, 40, 22, 34, 70, 100, 80, 46,
  28, 18, 42, 74, 52, 30, 16, 10,
];

export default function RecordingWidget() {
  const [seconds, setSeconds] = useState(320);
  const [status, setStatus] = useState('paused');
  const canvasRef = useRef(null);
  const barsRef = useRef(wave.slice(-40).map((height, index) => ({ x: index * 3, height, target: height })));
  const clearBarsTimer = useRef();

  useEffect(() => {
    if (status !== 'recording') return;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    const context = canvasRef.current.getContext('2d');
    const draw = () => {
      context.clearRect(0, 0, 240, 288);
      context.fillStyle = '#91949b';
      barsRef.current.forEach(({ x, height }) => {
        context.fillRect(
          Math.round(x * 2),
          Math.round((72 - height / 2) * 2),
          4,
          Math.max(2, Math.round(height * 2)),
        );
      });
    };

    if (status !== 'recording' || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw();
      return;
    }

    if (barsRef.current.length === 0) barsRef.current.push({ x: 119, height: 1, target: 24 });
    let frame;
    let previousTime = performance.now();
    let spawnTime = 0;
    const animate = (time) => {
      const elapsed = Math.min(time - previousTime, 32);
      previousTime = time;
      spawnTime += elapsed;
      barsRef.current.forEach((bar) => {
        bar.x -= elapsed / 40;
        bar.height = Math.min(bar.target, bar.height + (bar.target - 1) * elapsed / 180);
      });
      if (spawnTime >= 120) {
        spawnTime -= 120;
        const previous = barsRef.current.at(-1)?.target ?? 12;
        const target = Math.round(previous * .35 + (8 + Math.random() ** 1.8 * 120) * .65);
        barsRef.current.push({ x: 119, height: 1, target });
      }
      barsRef.current = barsRef.current.filter(({ x }) => x > -2);
      draw();
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [status]);

  useEffect(() => () => clearTimeout(clearBarsTimer.current), []);

  const time = new Date(seconds * 1000).toISOString().slice(11, 19);
  const handleStop = () => {
    if (status === 'stopped') {
      clearTimeout(clearBarsTimer.current);
      barsRef.current = [];
      setStatus('recording');
      return;
    }
    setSeconds(0);
    setStatus('stopped');
    clearBarsTimer.current = setTimeout(() => { barsRef.current = []; }, 180);
  };

  return (
    <div className={`widget recording-widget is-${status}`}>
      <div className="waveform" aria-hidden="true">
        <canvas ref={canvasRef} className="wave-history" width="240" height="288" />
        <i className="playhead" />
      </div>
      <div className="record-meta">
        <span><b />{status}</span>
        <strong>{time}</strong>
      </div>
      <button type="button" className="record-pause" aria-label={status === 'recording' ? 'Pause recording' : status === 'paused' ? 'Resume recording' : 'Start recording'} onClick={() => setStatus(status === 'recording' ? 'paused' : 'recording')}>
        <i className={`iconfont ${status === 'recording' ? 'icon-pause' : 'icon-play'}`} />
      </button>
      <button type="button" className="record-stop" aria-label={status === 'stopped' ? 'Start recording' : 'Stop recording'} onClick={handleStop}>
        <i className={`iconfont ${status === 'stopped' ? 'icon-play' : 'icon-stop'}`} />
      </button>
    </div>
  );
}
