import { useState } from 'react';
import './RadioWidget.css';

const stations = [
  '88.5',
  '91.3',
  '93.6',
  '97.2',
  '99.9',
  '101.8',
  '104.7',
  '106.4',
];

export default function RadioWidget() {
  const [stationIndex, setStationIndex] = useState(3);
  const [isOn, setIsOn] = useState(true);
  const changeStation = (step) => setStationIndex((index) => (index + step + stations.length) % stations.length);
  const frequency = stations[stationIndex];

  return (
    <div className={`widget radio-widget ${isOn ? 'is-on' : ''}`}>
      <div className="radio-display">
        <div className="radio-ticks" />
        <i className="needle" style={{ left: `${16 + stationIndex * (180 / 7)}px` }} />
        <strong><small>FM</small>{frequency}</strong>
        <span>96.0KHz · 24bit</span>
      </div>
      <p>Como Radio</p>
      <div className="radio-actions">
        <button type="button" aria-label="Previous station" onClick={() => isOn && changeStation(-1)}><span className="button-face"><i className="iconfont icon-skip-back" /></span></button>
        <button type="button" aria-label="Next station" onClick={() => isOn && changeStation(1)}><span className="button-face"><i className="iconfont icon-skip-forward" /></span></button>
        <button type="button" className="power" aria-label="Power" aria-pressed={isOn} onClick={() => setIsOn((on) => !on)}><span className="button-face"><i className="iconfont icon-power-01" /></span></button>
      </div>
    </div>
  );
}
