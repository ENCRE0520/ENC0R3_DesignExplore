import { useState } from 'react';
import './MusicWidget.css';

const songs = [
  ['Until I Found You', 'Daniel Caesar'],
  ['Japanese Denim', 'Daniel Caesar'],
  ['Die For You', 'Joji'],
];

const themes = [
  // Theme 0: Until I Found You (Purple - Original)
  {
    '--mw-bg': '#f5c3fe',
    '--mw-text': '#2b0059',
    '--mw-btn-bg': '#c587f7',
    '--mw-btn-text': '#2b0059',
    '--mw-primary-bg': '#8029ce',
    '--mw-primary-text': 'white',
    '--mw-note-bg': '#ffebff',
    '--mw-note-text': '#2b0059',
  },
  // Theme 1: Japanese Denim (Blue)
  {
    '--mw-bg': '#c3d9fe',
    '--mw-text': '#001a4d',
    '--mw-btn-bg': '#87aaf7',
    '--mw-btn-text': '#001a4d',
    '--mw-primary-bg': '#295cce',
    '--mw-primary-text': 'white',
    '--mw-note-bg': '#ebf2ff',
    '--mw-note-text': '#001a4d',
  },
  // Theme 2: Die For You (Red/Dark)
  {
    '--mw-bg': '#fec3c3',
    '--mw-text': '#4d0000',
    '--mw-btn-bg': '#f78787',
    '--mw-btn-text': '#4d0000',
    '--mw-primary-bg': '#ce2929',
    '--mw-primary-text': 'white',
    '--mw-note-bg': '#ffebeb',
    '--mw-note-text': '#4d0000',
  }
];

function setRippleOrigin(event) {
  const button = event.currentTarget;
  const { left, top, width, height } = button.getBoundingClientRect();
  button.style.setProperty('--ripple-x', `${(event.clientX - left) * button.offsetWidth / width}px`);
  button.style.setProperty('--ripple-y', `${(event.clientY - top) * button.offsetHeight / height}px`);
}

export default function MusicWidget() {
  const [songIndex, setSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const changeSong = (step) => setSongIndex((index) => (index + step + songs.length) % songs.length);
  const [title, artist] = songs[songIndex];

  return <div className="widget music-widget" style={themes[songIndex]}>
    <div className="song" key={songIndex}><strong>{title}</strong><small>{artist}</small></div>
    <div className="music-controls">
      <button type="button" aria-label="Previous track" onPointerDown={setRippleOrigin} onClick={() => changeSong(-1)}><i className="iconfont icon-skip-back" /></button>
      <button type="button" className={`pause ${isPlaying ? 'is-playing' : ''}`} aria-label={isPlaying ? 'Pause' : 'Play'} onPointerDown={setRippleOrigin} onClick={() => setIsPlaying((playing) => !playing)}>
        <span className="playback-icon"><i className="iconfont icon-play" /><i className="iconfont icon-pause-square" /></span>
      </button>
      <button type="button" aria-label="Next track" onPointerDown={setRippleOrigin} onClick={() => changeSong(1)}><i className="iconfont icon-skip-forward" /></button>
    </div>
    <button type="button" className="note" aria-label="Audio output" onPointerDown={setRippleOrigin}><i className="iconfont icon-airpods" /></button>
  </div>;
}
