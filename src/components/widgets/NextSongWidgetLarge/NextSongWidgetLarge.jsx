import { useState } from 'react';
import './NextSongWidgetLarge.css';

const songs = [
  { album: 'Submarine', title: 'Ay No Puedo' },
  { album: 'Submarine', title: 'Run Your Mouth' },
  { album: 'Submarine', title: 'Love You Anyway' },
];

export default function NextSongWidgetLarge() {
  const [songIndex, setSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const song = songs[songIndex];
  const nextSong = () => setSongIndex((index) => (index + 1) % songs.length);
  const previousSong = () => setSongIndex((index) => (index - 1 + songs.length) % songs.length);

  return (
    <div className="widget nswl-widget">
      <div className="nswl-album" aria-hidden="true">
        <span className="nswl-album-ring" />
        <span className="nswl-album-crop">
          <img src="/next-song-album.png" alt="" />
        </span>
      </div>

      <img className="nswl-overlay" src="/next-song-overlay.svg" alt="" aria-hidden="true" />

      <div className="nswl-song-info" aria-live="polite">
        <span>{song.album}</span>
        <strong>{song.title}</strong>
      </div>

      <div className="nswl-player" role="group" aria-label="Playback controls">
        <div className="nswl-controls">
          <button
            className="nswl-control nswl-play"
            type="button"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            aria-pressed={isPlaying}
            onClick={() => setIsPlaying((playing) => !playing)}
          >
            <i className={`iconfont ${isPlaying ? 'icon-pause' : 'icon-play'}`} />
          </button>
          <button
            className={`nswl-control nswl-heart ${isFavorite ? 'is-active' : ''}`}
            type="button"
            aria-label="Favorite song"
            aria-pressed={isFavorite}
            onClick={() => setIsFavorite((favorite) => !favorite)}
          >
            <i className="iconfont icon-heart" />
          </button>
          <button className="nswl-control nswl-scan" type="button" aria-label="Previous song" onClick={previousSong}>
            <i className="iconfont icon-skip-back" />
          </button>
        </div>
        <button className="nswl-next-song" type="button" onClick={nextSong}>Next Song</button>
      </div>
    </div>
  );
}
