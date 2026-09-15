import { useEffect, useRef, useState } from 'react';
import './RadioWidgetLarge.css';
import pixelHeart from '../../../assets/pixel-heart.svg';

const stations = [87.2, 91.5, 97.3, 101.3, 102.6, 103.1];
const SCALE_MIN = 87;
const SCALE_LABEL_MAX = 103;

export default function RadioWidgetLarge() {
  const [stationIndex, setStationIndex] = useState(2);
  const [volume, setVolume] = useState(40);
  const [showVolume, setShowVolume] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isOn, setIsOn] = useState(true);
  const volumeHideTimer = useRef(null);

  const frequency = stations[stationIndex];
  /* Fraction within the label range 87–103 MHz;
     the labels sit at left:3px / right:3px inside .rwl-tuner,
     so we use calc() to place the needle in the same coordinate space. */
  const needleFraction = (frequency - SCALE_MIN) / (SCALE_LABEL_MAX - SCALE_MIN);
  const tune = (step) => {
    if (!isOn) return;
    setStationIndex((index) => (index + step + stations.length) % stations.length);
  };

  const hideVolumeIndicator = () => {
    if (volumeHideTimer.current) window.clearTimeout(volumeHideTimer.current);
    volumeHideTimer.current = null;
    setShowVolume(false);
  };

  const adjustVolume = (step) => {
    if (!isOn) return;
    setVolume((value) => Math.max(0, Math.min(100, value + step)));
    setShowVolume(true);
    if (volumeHideTimer.current) window.clearTimeout(volumeHideTimer.current);
    volumeHideTimer.current = window.setTimeout(() => {
      setShowVolume(false);
      volumeHideTimer.current = null;
    }, 1400);
  };

  useEffect(() => () => {
    if (volumeHideTimer.current) window.clearTimeout(volumeHideTimer.current);
  }, []);

  const togglePower = () => {
    if (isOn) hideVolumeIndicator();
    setIsOn((on) => !on);
  };

  return (
    <div className={`widget rwl-widget ${isOn ? 'is-on' : 'is-off'}`}>
      <div className="rwl-chassis">
        <section className="rwl-lcd" aria-live="polite">
          <p className="rwl-station-name">Como Radio</p>
          <div className="rwl-reading">
            <span>FM</span>
            <strong>{frequency.toFixed(1)}</strong>
          </div>
          <div
            className={`rwl-volume-indicator ${showVolume ? 'is-visible' : ''}`}
            aria-hidden={!showVolume || !isOn}
            aria-label={`Volume ${volume}%`}
          >
            <span className="rwl-volume-label">VOL</span>
            <span className="rwl-volume-track" aria-hidden="true">
              {Array.from({ length: 10 }, (_, index) => (
                <i key={index} className={`rwl-volume-segment ${index < Math.round(volume / 10) ? 'is-active' : ''}`} />
              ))}
            </span>
            <span className="rwl-volume-value">{String(volume).padStart(2, '0')}</span>
          </div>
          <p className="rwl-quality">96.0KHz · 24bit</p>
          <div className="rwl-presets">
            <span aria-hidden="true"><img className="rwl-preset-heart" src={pixelHeart} alt="" draggable={false} /></span>
            {stations.map((station, index) => (
              <button
                type="button"
                key={station}
                className={stationIndex === index ? 'active' : ''}
                onClick={() => isOn && setStationIndex(index)}
                aria-label={`Tune to ${station.toFixed(1)} FM`}
              >
                {station.toFixed(1)}
              </button>
            ))}
          </div>
        </section>

        <section className="rwl-controls" aria-label="Radio controls">
          <div className="rwl-tuner" aria-label={`Tuner at ${frequency.toFixed(1)} FM`}>
            <div className="rwl-ticks" />
            <div className="rwl-needle" style={{ left: `calc(3px + ${needleFraction * 100}% - ${needleFraction * 6}px)` }} />
            <div className="rwl-scale-labels" aria-hidden="true">
              {[87, 89, 91, 93, 95, 97, 99, 101, 103].map((label) => <span key={label}>{label}</span>)}
            </div>
          </div>

          <div className="rwl-small-actions">
            <div className="rwl-action-pair">
              <button type="button" aria-label={`Volume up, current volume ${volume}`} onClick={() => adjustVolume(10)}><i className="iconfont icon-plus" /></button>
              <span className="rwl-between-icon"><i className="iconfont icon-volume-min" /></span>
              <button type="button" aria-label={`Volume down, current volume ${volume}`} onClick={() => adjustVolume(-10)}><i className="iconfont icon-minus" /></button>
            </div>
            <button
              type="button"
              className={`rwl-favorite ${isFavorite ? 'active' : ''}`}
              aria-label="Favorite station"
              aria-pressed={isFavorite}
              onClick={() => isOn && setIsFavorite((favorite) => !favorite)}
            >
              <i className="iconfont icon-heart" />
            </button>
            <div className="rwl-action-pair rwl-navigation">
              <button type="button" aria-label="Tune backward" onClick={() => tune(-1)}><i className="iconfont icon-chevron-left" /></button>
              <span className="rwl-between-icon"><i className="iconfont icon-signal-03" /></span>
              <button type="button" aria-label="Tune forward" onClick={() => tune(1)}><i className="iconfont icon-chevron-right" /></button>
            </div>
          </div>

          <div className="rwl-transport">
            <button type="button" aria-label="Previous station" onClick={() => tune(-1)}><i className="iconfont icon-skip-back" /></button>
            <button type="button" aria-label="Next station" onClick={() => tune(1)}><i className="iconfont icon-skip-forward" /></button>
            <button
              type="button"
              className="rwl-power"
              aria-label="Power"
              aria-pressed={isOn}
              onClick={togglePower}
            >
              <i className="iconfont icon-power-01" />
            </button>
          </div>
        </section>
      </div>
      <span className="rwl-brand">Como Radio</span>
    </div>
  );
}
