import { useState } from 'react';
import NextSongCDButton from '../../buttons/NextSongCDButton';
import './NextSongCDWidget.css';

const songs = [
  { album: 'Submarine', title: 'Ay No Puedo' },
  { album: 'Submarine', title: 'Run Your Mouth' },
  { album: 'Submarine', title: 'Love You Anyway' },
];

export function NextSongCDWidget({ compact = true }) {
  const [songIndex, setSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(compact);
  const [isFavorite, setIsFavorite] = useState(false);
  const song = songs[songIndex];
  const nextSong = () => setSongIndex((index) => (index + 1) % songs.length);
  const previousSong = () => setSongIndex((index) => (index - 1 + songs.length) % songs.length);

  return (
    <div className={`widget nscd-widget${compact ? ' nscd-widget--compact' : ''}`}>
      <div className={`nscd-album${isPlaying ? ' is-playing' : ''}`} aria-hidden="true">
        <span className="nscd-album-ring" />
        <span className="nscd-album-crop">
          <img className={`nscd-cd-disc${isPlaying ? ' is-shimmering' : ''}`} src="/next-song-album.png" alt="" />
          <span className={`nscd-cd-sheen${isPlaying ? ' is-spinning' : ''}`} />
        </span>
      </div>

      <img className="nscd-overlay" src="/next-song-overlay.svg" alt="" aria-hidden="true" />

      <div className="nscd-song-info" aria-live="polite">
        <span>{song.album}</span>
        <strong>{song.title}</strong>
      </div>

      <div className="nscd-player" role="group" aria-label="Playback controls">
        <div className="nscd-controls">
          <button
            className="nscd-control nscd-play"
            type="button"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            aria-pressed={isPlaying}
            onClick={() => setIsPlaying((playing) => !playing)}
          >
            <i className={`iconfont ${isPlaying ? 'icon-pause' : 'icon-play'}`} />
          </button>
          {!compact && (
            <button
              className={`nscd-control nscd-heart ${isFavorite ? 'is-active' : ''}`}
              type="button"
              aria-label="Favorite song"
              aria-pressed={isFavorite}
              onClick={() => setIsFavorite((favorite) => !favorite)}
            >
              <i className="iconfont icon-heart" />
            </button>
          )}
          {!compact && (
            <button className="nscd-control nscd-scan" type="button" aria-label="Previous song" onClick={previousSong}>
              <i className="iconfont icon-skip-back" />
            </button>
          )}
        </div>
        <NextSongCDButton size="widget" withContainer={false} onClick={nextSong} />
      </div>
    </div>
  );
}

export function NextSongCDWidgetLarge(props) {
  return <NextSongCDWidget {...props} compact={false} />;
}

export default NextSongCDWidget;
