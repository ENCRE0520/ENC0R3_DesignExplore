import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimationManager } from '@liquid-dom/react';
import MusicLiquidOverlay from './MusicLiquidOverlay';
import {
  LIQUID_DRAG_SPRING,
  PRESS_PEAK_DELAY_MS,
  PRESS_PEAK_SCALE,
  PRESS_REST_SCALE,
  clamp,
  getDragDeformationStrength,
  getElasticDragTransform,
  getHighlightPointForDrag,
  getPressDuration,
} from '../../../utils/liquidGlassMotion';
import './NextSongWidgetLarge.css';

const assets = {
  compact: {
    menu: '/figma-daily-widget/square-menu.svg',
    nextTop: '/figma-daily-widget/square-next-top.svg',
    skipBack: '/figma-daily-widget/square-skip-back.svg',
    play: '/figma-daily-widget/square-play.svg',
    pause: '/figma-daily-widget/pause.svg',
    skipForward: '/figma-daily-widget/square-skip-forward.svg',
    nextBottom: '/figma-daily-widget/square-next-bottom.svg',
    star: '/figma-daily-widget/star.png',
    starFill: '/figma-daily-widget/star-fill.png',
  },
  wide: {
    menu: '/figma-daily-widget/wide-menu.svg',
    nextTop: '/figma-daily-widget/wide-next-top.svg',
    skipBack: '/figma-daily-widget/wide-skip-back.svg',
    play: '/figma-daily-widget/wide-play.svg',
    pause: '/figma-daily-widget/pause.svg',
    skipForward: '/figma-daily-widget/wide-skip-forward.svg',
    nextBottom: '/figma-daily-widget/wide-next-bottom.svg',
    star: '/figma-daily-widget/star.png',
    starFill: '/figma-daily-widget/star-fill.png',
  },
};

const songs = [
  {
    title: 'drop dead',
    artist: 'Olivia Rodrigo',
    album: 'you seem pretty sad for a girl so in love',
    cover: '/figma-daily-widget/covers/swing.png',
    gradient: 'linear-gradient(180deg in oklab, #17242c 0%, #22343e 8%, #2f4651 16%, #3b5561 24%, #405a68 32%, #526d7c 40%, #678594 50%, #7895a3 62%, #8aa3ad 70%, #9eb2ba 82%, #b7a5a0 90%, #d79a8f 100%)',
    tracks: ['drop dead'],
    lyrics: [
      'know that the bar closes at 11',
      'I hope you never finish that beer',
      'You know all the words to "Just Like Heaven"',
      'And I know why he wrote them',
      'Now that you\'re standing right here',
      'Ohh',
      'One night I was bored in bed',
      'And stalked you on the internet',
      "It's feminine intuition",
      "'Cuz I always had a vision of us standing like this",
      'All pressed up in the bathroom line',
      "You're looking like an angel on the walls of Versailles",
      'The most alive I\'ve ever been',
      'But kiss me and I might drop dead',
      'And I feel like I might throw up',
      'Left hook, right punch to the gut',
      "You're so so pretty boy",
      "I'm paranoid I made you up",
      "Yeah I'd love it if you walked me home",
      'If you promised we could go real slow',
      "'Cuz I got chewing gum",
      "And a bunch of stuff I'd like to know",
      'Like, have you ever been to Japan?',
      'Or taken that Eurostar to France?',
    ],
  },
  {
    title: 'Always',
    artist: 'Daniel Caesar',
    album: 'NEVER ENOUGH',
    cover: '/figma-daily-widget/covers/always.png',
    gradient: 'linear-gradient(180deg in oklab, #00020e 0%, #01030f 4%, #020710 8%, #040c21 12.5%, #050f28 18%, #071633 25%, #0d2146 29%, #142a52 32.7%, #182f5d 36%, #234274 41%, #2d5290 48%, #3864a9 54%, #4c75b6 61%, #5980bd 66.8%, #6b8dc5 72%, #7899cc 77.9%, #8ca8d4 84%, #98b3dc 88.9%, #a7bee4 94%, #b7cceb 100%)',
    tracks: ['Always'],
    lyrics: [
      'Baby, baby, there will always be',
      'A space for you and me, right where you left it',
      'And just maybe, enough time will pass',
      "We'll look back and laugh, just don't forget it",
    ],
  },
  {
    title: 'hate that i made you love me',
    artist: 'Ariana Grande',
    album: 'petal',
    cover: '/figma-daily-widget/covers/portrait.png',
    gradient: 'linear-gradient(180deg in oklab, #080808 0%, #0c0c0c 10%, #101010 20%, #121212 30%, #1b1b1b 40%, #242424 50%, #292929 58%, #3b3b3b 68%, #4d4d4d 76%, #555 82%, #6b6b6b 90%, #8a8a8a 100%)',
    tracks: ['hate that i made you love me'],
    lyrics: [
      'Soft light across the room',
      'Let the whole night open up',
      'I know where I belong',
      'Bittersweet',
    ],
  },
];

const LYRIC_HOLD_MS = 2800;
const LYRIC_PROGRESS_STEP_MS = 1400;
const LYRIC_PROGRESS_HALF_STEP_MS = 700;
const LYRIC_PROGRESS_TOTAL_STEPS = 3;
const LYRIC_PROGRESS_EXIT_MS = 220;
const LYRIC_LINE_EXIT_MS = 300;
const LYRIC_LINE_MOVE_MS = 300;
const LYRIC_SONG_EXIT_MS = 300;
const LYRIC_SONG_ENTER_MS = 300;
const COVER_TRANSITION_MS = 480;
const COVER_TRANSITION_CLEANUP_MS = 48;

function getCoverCards(activeIndex, coverTransition) {
  if (!coverTransition) {
    return [
      { slot: 'exit', index: activeIndex, role: 'carousel-hidden' },
      { slot: 'left', index: (activeIndex - 1 + songs.length) % songs.length, role: 'previous' },
      { slot: 'center', index: activeIndex, role: 'active' },
      { slot: 'right', index: (activeIndex + 1) % songs.length, role: 'next' },
    ];
  }

  const { direction, from } = coverTransition;
  const to = (from + direction + songs.length) % songs.length;

  if (direction > 0) {
    return [
      { slot: 'exit', index: (from - 1 + songs.length) % songs.length, role: 'carousel-exit-left' },
      { slot: 'left', index: from, role: 'carousel-move-left' },
      { slot: 'center', index: to, role: 'carousel-move-center' },
      { slot: 'right', index: (to + 1) % songs.length, role: 'carousel-enter-right' },
    ];
  }

  return [
    { slot: 'exit', index: (from + 1) % songs.length, role: 'carousel-exit-right' },
    { slot: 'left', index: (to - 1 + songs.length) % songs.length, role: 'carousel-enter-left' },
    { slot: 'center', index: to, role: 'carousel-move-center-reverse' },
    { slot: 'right', index: from, role: 'carousel-move-right' },
  ];
}

export function MusicVisual({
  compact = false,
  liquidSource = false,
  activeIndex = 0,
  lyricSongIndex = activeIndex,
  activeLyricIndex = 0,
  lyricProgress = null,
  lyricTransition = null,
  lyricSongTransition = null,
  coverTransition = null,
}) {
  const lyricSong = songs[lyricSongIndex];
  const lyricTrackRef = useRef(null);
  const lyricLineRefs = useRef([]);
  const [lyricOffsets, setLyricOffsets] = useState([]);

  useLayoutEffect(() => {
    const track = lyricTrackRef.current;
    if (!track) return undefined;

    const measureLyrics = () => {
      setLyricOffsets(lyricLineRefs.current.map((line) => line?.offsetTop ?? 0));
    };

    measureLyrics();
    const resizeObserver = new ResizeObserver(measureLyrics);
    resizeObserver.observe(track);

    return () => resizeObserver.disconnect();
  }, [lyricSong.title, lyricSong.lyrics.length, compact]);

  const activeLyricOffset = lyricOffsets[activeLyricIndex] ?? 0;
  const lyricProgressOffset = (lyricProgress?.phase === 'exit' || lyricProgress?.phase === 'hidden') ? 32 : 0;
  const lyricHasStarted = !lyricProgress || lyricProgress.phase === 'exit' || lyricProgress.phase === 'hidden';

  return (
    <div
      className={`nswl-visual${compact ? ' nswl-visual--compact' : ' nswl-visual--wide'}${liquidSource ? ' nswl-visual--liquid-source' : ''}`}
    >
      <div className="nswl-backgrounds" aria-hidden="true">
        {songs.map((song, index) => (
          <div
            className={`nswl-background${index === activeIndex ? ' nswl-background--active' : ''}`}
            key={song.cover}
            style={{ backgroundImage: song.gradient }}
          />
        ))}
      </div>

      <div
        className={`nswl-lyrics${lyricSongTransition ? ` nswl-lyrics--${lyricSongTransition.phase}` : ''}`}
        aria-hidden="true"
      >
        <LyricProgress
          step={lyricProgress?.step ?? 0}
          phase={lyricProgress?.phase ?? 'idle'}
          pulseKey={lyricProgress?.pulse ?? 0}
        />
        <div
          ref={lyricTrackRef}
          className="nswl-lyrics-track"
          style={{ '--nswl-lyrics-y': `${-activeLyricOffset - lyricProgressOffset}px` }}
        >
          {lyricSong.lyrics.map((line, index) => (
            <p
              ref={(node) => {
                lyricLineRefs.current[index] = node;
              }}
              className={`nswl-lyrics-line${lyricHasStarted && index === activeLyricIndex ? ' nswl-lyrics-line--active' : ''}${lyricHasStarted && index < activeLyricIndex ? ' nswl-lyrics-line--played' : ''}${index === lyricTransition?.from ? ' nswl-lyrics-line--exiting' : ''}${index === lyricTransition?.to && lyricTransition?.phase === 'move' ? ' nswl-lyrics-line--entering' : ''}`}
              key={`${lyricSong.title}-${line}`}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {!compact && (
        <div className="nswl-album-cover" aria-hidden="true">
          {getCoverCards(activeIndex, coverTransition).map(({ index, role, slot }) => (
            <img
              className={`nswl-cover-card nswl-cover-card--${role}`}
              src={songs[index].cover}
              alt=""
              key={slot}
              draggable={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LyricProgress({ step = 0, phase = 'idle', pulseKey = 0 }) {
  const pulseClass = pulseKey % 2 === 0
    ? 'nswl-lyrics-progress--pulse-a'
    : 'nswl-lyrics-progress--pulse-b';
  const shouldPulse = phase === 'active' && pulseKey > 0;
  const canLightDots = phase === 'active' || phase === 'exit';

  return (
    <div
      className={`nswl-lyrics-progress${phase === 'exit' ? ' nswl-lyrics-progress--exiting' : ''}${phase === 'hidden' ? ' nswl-lyrics-progress--hidden' : ''}${shouldPulse ? ` ${pulseClass}` : ''}`}
      aria-hidden="true"
    >
      <span className="nswl-lyrics-progress-dots">
        {[0, 1, 2].map((index) => (
          <span
            className={`nswl-lyrics-progress-dot${canLightDots && index < step ? ' nswl-lyrics-progress-dot--active' : ''}`}
            key={index}
          />
        ))}
      </span>
    </div>
  );
}

function IconButton({
  label,
  src,
  className = '',
  onClick,
  pressed,
  pressTarget,
  onPressStart,
  onPressEnd,
  onPressMove,
  pressing = false,
  pressScale = 1,
  pressOnPointer = true,
  capturePointer = false,
  highlight = null,
  dragTransform = null,
  children,
}) {
  const dragSurfaceStyle = {
    '--nswl-drag-scale-x': dragTransform?.scaleX ?? 1,
    '--nswl-drag-scale-y': dragTransform?.scaleY ?? 1,
    '--nswl-drag-translate-x': `${dragTransform?.translateX ?? 0}px`,
    '--nswl-drag-translate-y': `${dragTransform?.translateY ?? 0}px`,
    '--nswl-drag-origin-x': `${(dragTransform?.originX ?? 0.5) * 100}%`,
    '--nswl-drag-origin-y': `${(dragTransform?.originY ?? 0.5) * 100}%`,
  };

  const beginPress = (event) => {
    if (pressTarget) {
      if (event?.pointerId != null) {
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }
      onPressStart?.(pressTarget, event);
    }
  };

  const endPress = (event) => {
    if (pressTarget) {
      if (
        event?.pointerId != null
        && event.currentTarget.hasPointerCapture?.(event.pointerId)
      ) {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      }
      onPressEnd?.(pressTarget);
    }
  };

  const captureOnlyPointer = (event) => {
    if (capturePointer && event?.pointerId != null) {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
  };

  const releaseOnlyPointer = (event) => {
    if (
      capturePointer
      && event?.pointerId != null
      && event.currentTarget.hasPointerCapture?.(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
  };

  const movePress = (event) => {
    if (pressTarget) onPressMove?.(pressTarget, event);
  };

  const handleKeyDown = (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
      beginPress();
    }
  };

  return (
    <button
      className={`nswl-icon-button ${className}${pressing ? ' nswl-icon-button--pressing' : ''}`.trim()}
      type="button"
      style={{
        '--nswl-press-scale': pressing ? pressScale : 1,
      }}
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      onPointerDown={pressOnPointer ? beginPress : capturePointer ? captureOnlyPointer : undefined}
      onPointerUp={pressOnPointer ? endPress : capturePointer ? releaseOnlyPointer : undefined}
      onPointerCancel={pressOnPointer ? endPress : capturePointer ? releaseOnlyPointer : undefined}
      onPointerLeave={pressOnPointer ? (event) => {
        if (!event.currentTarget.hasPointerCapture?.(event.pointerId)) {
          endPress(event);
        }
      } : undefined}
      onPointerMove={pressOnPointer ? movePress : undefined}
      onKeyDown={handleKeyDown}
      onKeyUp={endPress}
      onBlur={endPress}
    >
      <span className="nswl-icon-drag-surface" style={dragSurfaceStyle}>
        <GlassHighlight point={highlight} />
        {children || <img src={src} alt="" draggable={false} />}
      </span>
    </button>
  );
}

function GlassHighlight({ point = null }) {
  return (
    <span
      className={`nswl-glass-highlight${point && point.visible !== false ? ' nswl-glass-highlight--active' : ''}`}
      style={{
        '--nswl-highlight-x': `${point?.x ?? 0}px`,
        '--nswl-highlight-y': `${point?.y ?? 0}px`,
      }}
      aria-hidden="true"
    />
  );
}

function PlayPauseIcon({ iconSet, isPlaying }) {
  return (
    <span className="nswl-play-icon-stack" aria-hidden="true">
      <img
        className={`nswl-play-icon${isPlaying ? ' nswl-play-icon--inactive' : ' nswl-play-icon--active'}`}
        src={iconSet.play}
        alt=""
        draggable={false}
      />
      <img
        className={`nswl-play-icon${isPlaying ? ' nswl-play-icon--active' : ' nswl-play-icon--inactive'}`}
        src={iconSet.pause}
        alt=""
        draggable={false}
      />
    </span>
  );
}

function FavoriteIcon({ iconSet, state }) {
  return (
    <span className="nswl-favorite-icon-stack" aria-hidden="true">
      <img
        className={`nswl-favorite-icon${state === 'plus' ? ' nswl-favorite-icon--active' : ''}`}
        src={iconSet.nextBottom}
        alt=""
        draggable={false}
      />
      <img
        className={`nswl-favorite-icon${state === 'star' ? ' nswl-favorite-icon--active' : ''}`}
        src={iconSet.star}
        alt=""
        draggable={false}
      />
      <img
        className={`nswl-favorite-icon${state === 'star-fill' ? ' nswl-favorite-icon--active' : ''}`}
        src={iconSet.starFill}
        alt=""
        draggable={false}
      />
    </span>
  );
}

function SongText({ song }) {
  const titleViewportRef = useRef(null);
  const titleContentRef = useRef(null);
  const [titleOverflow, setTitleOverflow] = useState(0);

  useLayoutEffect(() => {
    const viewport = titleViewportRef.current;
    const content = titleContentRef.current;
    if (!viewport || !content) return undefined;

    const measureTitle = () => {
      const overflow = Math.max(0, content.scrollWidth - viewport.clientWidth);
      setTitleOverflow(overflow);
    };

    measureTitle();
    const resizeObserver = new ResizeObserver(measureTitle);
    resizeObserver.observe(viewport);
    resizeObserver.observe(content);

    return () => resizeObserver.disconnect();
  }, [song.title]);

  const isTitleOverflowing = titleOverflow > 1;

  return (
    <div className="nswl-song-text" aria-live="polite">
      <span
        ref={titleViewportRef}
        className={`nswl-song-title${isTitleOverflowing ? ' nswl-song-title--overflowing' : ''}`}
        title={song.title}
        style={{ '--nswl-song-title-overflow': `${titleOverflow}px` }}
      >
        <strong className="nswl-song-title-static">{song.title}</strong>
        <strong ref={titleContentRef} className="nswl-song-title-marquee" aria-hidden="true">
          {song.title}
        </strong>
      </span>
      <span>{song.artist}</span>
    </div>
  );
}

export default function NextSongWidgetLarge({
  compact = false,
  isExpanded = false,
  isWebGPUSupported = true,
  onCompatibilityError,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [favoriteState, setFavoriteState] = useState('plus');
  const [pressedControl, setPressedControl] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lyricSongIndex, setLyricSongIndex] = useState(0);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);
  const [lyricProgress, setLyricProgress] = useState({
    step: 0,
    phase: 'idle',
    pulse: 0,
  });
  const [lyricTransition, setLyricTransition] = useState(null);
  const [lyricSongTransition, setLyricSongTransition] = useState(null);
  const [coverTransition, setCoverTransition] = useState(null);
  const activeIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const activeLyricRef = useRef(0);
  const lyricTransitionId = useRef(0);
  const lyricTransitionTimer = useRef(null);
  const lyricProgressTimer = useRef(null);
  const lyricProgressExitTimer = useRef(null);
  const lyricProgressStartFrame = useRef(null);
  const lyricPlaybackTimer = useRef(null);
  const changeTrackRef = useRef(null);
  const lyricSongTimer = useRef(null);
  const coverTransitionTimer = useRef(null);
  const pressScaleTimer = useRef(null);
  const pressScaleFrame = useRef(null);
  const pressedControlRef = useRef(null);
  const pressEndRef = useRef(null);
  const pressPointerStart = useRef(null);
  const pressDragRef = useRef(null);
  const dragAnimationFrame = useRef(null);
  const dragAnimationControls = useRef(null);
  const dragAnimationValue = useRef(null);
  const dragAnimationMeta = useRef(null);
  const dragAnimationLastTime = useRef(null);
  const dragReleaseStarted = useRef(false);
  const [dragAnimationManager] = useState(() => new AnimationManager());
  const [pressScale, setPressScale] = useState(1);
  const [pressPhase, setPressPhase] = useState('release');
  const [pressHighlight, setPressHighlight] = useState(null);
  const [pressDrag, setPressDrag] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => (
    typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));
  const iconSet = compact ? assets.compact : assets.wide;
  const activeSong = songs[activeIndex];
  const lyricSong = songs[lyricSongIndex];
  const pressDurationMs = getPressDuration(pressPhase);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event) => setPrefersReducedMotion(event.matches);

    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  const getPressPoint = (target, event) => {
    const surface = event?.currentTarget;
    if (!surface || event.clientX == null || event.clientY == null) return null;

    const rect = surface.getBoundingClientRect();
    const width = surface.offsetWidth || rect.width;
    const height = surface.offsetHeight || rect.height;
    const scaleX = rect.width / width || 1;
    const scaleY = rect.height / height || 1;
    const rawX = (event.clientX - rect.left) / scaleX;
    const rawY = (event.clientY - rect.top) / scaleY;
    const x = Math.min(Math.max(rawX, 0), width);
    const y = Math.min(Math.max(rawY, 0), height);

    return {
      target,
      x,
      y,
      rawX,
      rawY,
      width,
      height,
      clientX: event.clientX,
      clientY: event.clientY,
      pointerId: event.pointerId ?? null,
      pointerScaleX: scaleX,
      pointerScaleY: scaleY,
    };
  };

  const stopDragAnimation = () => {
    dragAnimationControls.current?.stop();
    dragAnimationControls.current = null;
    if (dragAnimationFrame.current !== null) {
      cancelAnimationFrame(dragAnimationFrame.current);
      dragAnimationFrame.current = null;
    }
    dragAnimationValue.current = null;
    dragAnimationMeta.current = null;
    dragAnimationLastTime.current = null;
  };

  const startDragReturn = (target, currentDrag) => {
    if (!currentDrag || prefersReducedMotion) {
      pressDragRef.current = null;
      setPressDrag(null);
      dragReleaseStarted.current = false;
      return;
    }

    stopDragAnimation();
    const animatedValue = {
      scaleX: currentDrag.scaleX,
      scaleY: currentDrag.scaleY,
      translateX: currentDrag.translateX ?? 0,
      translateY: currentDrag.translateY ?? 0,
    };
    dragAnimationValue.current = animatedValue;
    dragAnimationMeta.current = {
      target,
      originX: currentDrag.originX,
      originY: currentDrag.originY,
    };
    dragAnimationControls.current = dragAnimationManager.animate(
      animatedValue,
      { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0 },
      LIQUID_DRAG_SPRING,
    );

    const tickDragReturn = (time) => {
      const value = dragAnimationValue.current;
      const meta = dragAnimationMeta.current;
      if (!value || !meta) return;

      const previousTime = dragAnimationLastTime.current ?? time;
      dragAnimationLastTime.current = time;
      dragAnimationManager.tick(Math.max(0, time - previousTime));

      const nextDrag = {
        target: meta.target,
        scaleX: value.scaleX,
        scaleY: value.scaleY,
        translateX: value.translateX,
        translateY: value.translateY,
        originX: meta.originX,
        originY: meta.originY,
      };
      pressDragRef.current = nextDrag;
      setPressDrag(nextDrag);

      if (dragAnimationManager.active) {
        dragAnimationFrame.current = requestAnimationFrame(tickDragReturn);
        return;
      }

      // Publish one explicit rest frame before removing the drag object. This
      // prevents React's batched state update from skipping the last spring
      // frame and making the glass snap back to its final position.
      const restDrag = {
        target: meta.target,
        scaleX: 1,
        scaleY: 1,
        translateX: 0,
        translateY: 0,
        originX: 0.5,
        originY: 0.5,
      };
      pressDragRef.current = restDrag;
      setPressDrag(restDrag);
      dragAnimationControls.current = null;
      dragAnimationValue.current = null;
      dragAnimationMeta.current = null;
      dragAnimationLastTime.current = null;
      dragAnimationFrame.current = requestAnimationFrame(() => {
        if (pressDragRef.current !== restDrag) return;
        pressDragRef.current = null;
        setPressDrag(null);
        dragReleaseStarted.current = false;
        dragAnimationFrame.current = null;
      });
    };

    dragAnimationFrame.current = requestAnimationFrame(tickDragReturn);
  };

  const handlePressStart = (target, event) => {
    clearTimeout(pressScaleTimer.current);
    cancelAnimationFrame(pressScaleFrame.current);
    stopDragAnimation();
    const point = getPressPoint(target, event);
    pressedControlRef.current = target;
    pressPointerStart.current = point;
    pressDragRef.current = null;
    dragReleaseStarted.current = false;
    setPressedControl(target);
    setPressPhase('reset');
    setPressHighlight(point);
    setPressDrag(null);
    // Commit the pressed target at its rest scale first. Starting the peak on
    // the next frame gives Liquid DOM a real 1 -> 1.15 transition origin.
    setPressScale(1);
    pressScaleFrame.current = requestAnimationFrame(() => {
      pressScaleFrame.current = null;
      setPressPhase('peak');
      setPressScale(PRESS_PEAK_SCALE);
      pressScaleTimer.current = setTimeout(() => {
        setPressPhase('settle');
        setPressScale(PRESS_REST_SCALE);
      }, PRESS_PEAK_DELAY_MS);
    });
  };
  const handlePressEnd = (target) => {
    const activeDrag = pressDragRef.current?.target === target ? pressDragRef.current : null;
    if (pressedControlRef.current !== target && pressedControl !== target && !activeDrag) return;

    if (pressedControlRef.current === target) {
      pressedControlRef.current = null;
    }
    setPressedControl((current) => (current === target ? null : current));
    if (pressPointerStart.current?.target === target) {
      pressPointerStart.current = null;
    }
    setPressHighlight((current) => (
      current?.target === target ? { ...current, visible: false } : current
    ));
    if (activeDrag && !dragReleaseStarted.current) {
      dragReleaseStarted.current = true;
      startDragReturn(target, activeDrag);
    } else if (!activeDrag) {
      pressDragRef.current = null;
      setPressDrag(null);
    }
    clearTimeout(pressScaleTimer.current);
    pressScaleTimer.current = null;
    cancelAnimationFrame(pressScaleFrame.current);
    pressScaleFrame.current = null;
    setPressPhase('release');
    setPressScale(1);
  };
  const handlePressMove = (target, event) => {
    if (pressedControlRef.current !== target) return;

    const point = getPressPoint(target, event);
    if (!point) return;

    const start = pressPointerStart.current;
    if (!start || start.target !== target) {
      setPressHighlight({ ...point, visible: true });
      return;
    }

    const dx = (point.clientX - start.clientX) / (start.pointerScaleX || 1);
    const dy = (point.clientY - start.clientY) / (start.pointerScaleY || 1);
    const dragStrength = getDragDeformationStrength(point, start);
    const dragTransform = getElasticDragTransform(dx, dy, dragStrength);
    const dragPoint = {
      ...point,
      x: clamp(start.x + dx, 0, start.width),
      y: clamp(start.y + dy, 0, start.height),
    };
    setPressHighlight({
      ...getHighlightPointForDrag(dragPoint, dragTransform),
      visible: true,
    });

    const nextDrag = {
      target,
      ...dragTransform,
    };
    pressDragRef.current = nextDrag;
    setPressDrag(nextDrag);
  };

  useLayoutEffect(() => {
    pressEndRef.current = handlePressEnd;
  });

  // Pointer capture normally routes the release back to the control, but it
  // can be lost when the browser cancels a gesture, the window blurs, or the
  // pointer leaves the app. Keep a window-level release path so the visual
  // press/drag state cannot remain stuck.
  useEffect(() => {
    if (!pressedControl) return undefined;

    const releaseFromWindow = (event) => {
      const target = pressedControlRef.current;
      if (!target) return;

      const pointerId = pressPointerStart.current?.pointerId;
      if (
        pointerId != null
        && event?.pointerId != null
        && event.pointerId !== pointerId
      ) {
        return;
      }

      pressEndRef.current?.(target);
    };
    const releaseFromBlur = () => {
      const target = pressedControlRef.current;
      if (target) pressEndRef.current?.(target);
    };
    const releaseFromVisibilityChange = () => {
      if (document.hidden) releaseFromBlur();
    };

    window.addEventListener('pointerup', releaseFromWindow);
    window.addEventListener('pointercancel', releaseFromWindow);
    window.addEventListener('blur', releaseFromBlur);
    document.addEventListener('visibilitychange', releaseFromVisibilityChange);

    return () => {
      window.removeEventListener('pointerup', releaseFromWindow);
      window.removeEventListener('pointercancel', releaseFromWindow);
      window.removeEventListener('blur', releaseFromBlur);
      document.removeEventListener('visibilitychange', releaseFromVisibilityChange);
    };
  }, [pressedControl]);

  useEffect(() => {
    cancelAnimationFrame(lyricProgressStartFrame.current);
    clearInterval(lyricProgressTimer.current);
    clearTimeout(lyricProgressTimer.current);

    if (lyricProgress.phase !== 'active' || activeLyricIndex !== 0) return undefined;

    let step = 0;
    const startFirstDotFrame = requestAnimationFrame(() => {
      step = 1;
      setLyricProgress((current) => ({
        step,
        phase: 'active',
        pulse: current.pulse + 1,
      }));

      lyricProgressTimer.current = setInterval(() => {
        step += 1;
        if (step < LYRIC_PROGRESS_TOTAL_STEPS) {
          setLyricProgress((current) => ({
            step,
            phase: 'active',
            pulse: current.pulse + 1,
          }));
          return;
        }

        clearInterval(lyricProgressTimer.current);
        lyricProgressTimer.current = null;
        setLyricProgress((current) => ({
          step: LYRIC_PROGRESS_TOTAL_STEPS,
          phase: 'active',
          pulse: current.pulse + 1,
        }));

        // The 3rd dot expands to its peak over LYRIC_PROGRESS_HALF_STEP_MS (700ms).
        // At peak apex, trigger exit so shrinking coincides with lyrics sliding up.
        lyricProgressTimer.current = setTimeout(() => {
          lyricProgressTimer.current = null;
          setLyricProgress((current) => ({
            ...current,
            phase: 'exit',
          }));
        }, LYRIC_PROGRESS_HALF_STEP_MS);
      }, LYRIC_PROGRESS_STEP_MS);
    });
    lyricProgressStartFrame.current = startFirstDotFrame;

    return () => {
      cancelAnimationFrame(startFirstDotFrame);
      clearInterval(lyricProgressTimer.current);
      clearTimeout(lyricProgressTimer.current);
      lyricProgressStartFrame.current = null;
      lyricProgressTimer.current = null;
    };
  }, [activeLyricIndex, lyricProgress.phase, lyricSongIndex]);

  useEffect(() => {
    clearTimeout(lyricProgressExitTimer.current);
    if (lyricProgress.phase !== 'exit') return undefined;

    lyricProgressExitTimer.current = setTimeout(() => {
      setLyricProgress((current) => ({
        ...current,
        phase: 'hidden',
      }));
    }, LYRIC_PROGRESS_EXIT_MS);

    return () => clearTimeout(lyricProgressExitTimer.current);
  }, [lyricProgress.phase]);

  useEffect(() => {
    if (!isPlaying || lyricProgress.phase !== 'hidden') return undefined;

    clearInterval(lyricPlaybackTimer.current);
    lyricPlaybackTimer.current = setInterval(() => {
      const from = activeLyricRef.current;
      if (from >= lyricSong.lyrics.length - 1) {
        clearInterval(lyricPlaybackTimer.current);
        lyricPlaybackTimer.current = null;
        changeTrackRef.current?.(1);
        return;
      }
      const to = from + 1;
      activeLyricRef.current = to;
      const transitionId = lyricTransitionId.current += 1;
      setLyricTransition({ from, to, id: transitionId, phase: 'exit' });
      clearTimeout(lyricTransitionTimer.current);
      lyricTransitionTimer.current = setTimeout(() => {
        setActiveLyricIndex(to);
        setLyricProgress((current) => ({
          ...current,
          phase: 'hidden',
        }));
        setLyricTransition({ from, to, id: transitionId, phase: 'move' });
        lyricTransitionTimer.current = setTimeout(() => setLyricTransition(null), LYRIC_LINE_MOVE_MS);
      }, LYRIC_LINE_EXIT_MS);
    }, LYRIC_HOLD_MS);

    return () => {
      clearInterval(lyricPlaybackTimer.current);
      lyricPlaybackTimer.current = null;
    };
  }, [isPlaying, lyricProgress.phase, lyricSong.lyrics.length, lyricSongIndex]);

  useEffect(() => () => {
    clearTimeout(lyricTransitionTimer.current);
    clearInterval(lyricPlaybackTimer.current);
    cancelAnimationFrame(lyricProgressStartFrame.current);
    clearInterval(lyricProgressTimer.current);
    clearTimeout(lyricProgressExitTimer.current);
    clearTimeout(lyricSongTimer.current);
    clearTimeout(coverTransitionTimer.current);
    clearTimeout(pressScaleTimer.current);
    cancelAnimationFrame(pressScaleFrame.current);
    stopDragAnimation();
    pressedControlRef.current = null;
    pressDragRef.current = null;
    pressPointerStart.current = null;
    dragReleaseStarted.current = false;
  }, []);

  const changeTrack = (offset) => {
    const from = activeIndexRef.current;
    const direction = offset >= 0 ? 1 : -1;
    const to = (from + direction + songs.length) % songs.length;
    const transitionId = `${from}-${to}-${Date.now()}`;
    activeIndexRef.current = to;
    setActiveIndex(to);
    setCoverTransition({ from, to, direction, id: transitionId });
    clearTimeout(coverTransitionTimer.current);
    coverTransitionTimer.current = setTimeout(
      () => setCoverTransition(null),
      COVER_TRANSITION_MS + COVER_TRANSITION_CLEANUP_MS,
    );

    clearInterval(lyricPlaybackTimer.current);
    lyricPlaybackTimer.current = null;
    clearTimeout(lyricSongTimer.current);
    cancelAnimationFrame(lyricProgressStartFrame.current);
    lyricProgressStartFrame.current = null;
    clearInterval(lyricProgressTimer.current);
    clearTimeout(lyricProgressTimer.current);
    clearTimeout(lyricProgressExitTimer.current);
    setLyricSongTransition({ phase: 'song-exit', id: transitionId });
    lyricSongTimer.current = setTimeout(() => {
      setLyricSongIndex(to);
      setActiveLyricIndex(0);
      setLyricProgress(() => ({
        step: 0,
        phase: isPlayingRef.current ? 'active' : 'idle',
        pulse: 0,
      }));
      setLyricSongTransition({ phase: 'song-enter', id: transitionId });
      lyricSongTimer.current = setTimeout(() => setLyricSongTransition(null), LYRIC_SONG_ENTER_MS);
    }, LYRIC_SONG_EXIT_MS);

    activeLyricRef.current = 0;
    clearTimeout(lyricTransitionTimer.current);
  };
  useEffect(() => {
    changeTrackRef.current = changeTrack;
  });

  const togglePlayback = () => {
    const nextIsPlaying = !isPlaying;
    isPlayingRef.current = nextIsPlaying;
    setIsPlaying(nextIsPlaying);
    setLyricProgress((current) => ({
      step: nextIsPlaying
        ? (current.phase === 'hidden' ? 1 : 0)
        : (current.phase === 'active' || current.phase === 'exit'
          ? 0
          : current.step),
      phase: nextIsPlaying
        ? (current.phase === 'hidden' ? 'hidden' : 'active')
        : (current.phase === 'active' || current.phase === 'exit'
          ? 'idle'
          : current.phase),
      pulse: 0,
    }));
  };

  const handleFavoriteToggle = () => {
    if (dragReleaseStarted.current) return;
    setFavoriteState((current) => {
      if (current === 'plus') return 'star';
      if (current === 'star') return 'star-fill';
      return 'star';
    });
  };

  const isVisualAnimating = (
    lyricProgress.phase === 'active'
    || lyricProgress.phase === 'exit'
    || Boolean(lyricTransition)
    || Boolean(coverTransition)
    || Boolean(lyricSongTransition)
  );

  return (
    <div className={`nswl-scale-frame${compact ? ' nswl-scale-frame--compact' : ' nswl-scale-frame--wide'}`}>
      <div className={`widget nswl-widget${compact ? ' nswl-widget--compact' : ''}${isPlaying ? ' nswl-widget--playing' : ''}`}>
        {compact ? null : (
          <MusicVisual
            compact={compact}
            activeIndex={activeIndex}
            lyricSongIndex={lyricSongIndex}
            activeLyricIndex={activeLyricIndex}
            lyricProgress={lyricProgress}
            lyricTransition={lyricTransition}
            lyricSongTransition={lyricSongTransition}
            coverTransition={coverTransition}
          />
        )}
      </div>

      <MusicLiquidOverlay
        compact={compact}
        isExpanded={isExpanded}
        isWebGPUSupported={isWebGPUSupported}
        onCompatibilityError={onCompatibilityError}
        pressedControl={pressedControl}
        pressScale={pressScale}
        pressPhase={pressPhase}
        pressDrag={pressDrag}
        reducedMotion={prefersReducedMotion}
        isAnimating={isVisualAnimating}
        contentVersion={`${activeIndex}-${activeLyricIndex}-${lyricProgress.step}-${lyricProgress.phase}-${lyricProgress.pulse}-${lyricTransition?.id ?? 'stable'}-${lyricTransition?.phase ?? 'stable'}-${coverTransition?.id ?? 'stable'}-${lyricSongTransition?.id ?? 'stable'}-${lyricSongTransition?.phase ?? 'stable'}-${pressedControl ?? 'stable'}-${favoriteState}`}
      >
        <MusicVisual
          compact={compact}
          liquidSource
          activeIndex={activeIndex}
          lyricSongIndex={lyricSongIndex}
          activeLyricIndex={activeLyricIndex}
          lyricProgress={lyricProgress}
          lyricTransition={lyricTransition}
          lyricSongTransition={lyricSongTransition}
          coverTransition={coverTransition}
        />
      </MusicLiquidOverlay>

      <div
        className="nswl-controls-layer"
        style={{ '--nswl-press-duration': `${pressDurationMs}ms` }}
      >
        <div className="nswl-song-bar">
          <SongText song={activeSong} />
        </div>

        <div className="nswl-player" role="group" aria-label="Playback controls">
          <div
            className={`nswl-controls${pressedControl === 'playback' ? ' nswl-controls--pressed' : ''}`}
            style={{
              '--nswl-press-scale': pressedControl === 'playback' ? pressScale : 1,
            }}
            onPointerDown={(event) => {
              const featureButton = event.target?.closest?.('.nswl-control');
              if (!featureButton) {
                event.currentTarget.setPointerCapture?.(event.pointerId);
              }
              handlePressStart('playback', event);
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
                event.currentTarget.releasePointerCapture?.(event.pointerId);
              }
              handlePressEnd('playback');
            }}
            onPointerCancel={(event) => {
              if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
                event.currentTarget.releasePointerCapture?.(event.pointerId);
              }
              handlePressEnd('playback');
            }}
            onPointerMove={(event) => handlePressMove('playback', event)}
          >
            <div
              className="nswl-controls-drag-surface"
              style={{
                '--nswl-drag-scale-x': pressDrag?.target === 'playback' ? pressDrag.scaleX : 1,
                '--nswl-drag-scale-y': pressDrag?.target === 'playback' ? pressDrag.scaleY : 1,
                '--nswl-drag-translate-x': `${pressDrag?.target === 'playback' ? pressDrag.translateX ?? 0 : 0}px`,
                '--nswl-drag-translate-y': `${pressDrag?.target === 'playback' ? pressDrag.translateY ?? 0 : 0}px`,
                '--nswl-drag-origin-x': `${(pressDrag?.target === 'playback' ? pressDrag.originX : 0.5) * 100}%`,
                '--nswl-drag-origin-y': `${(pressDrag?.target === 'playback' ? pressDrag.originY : 0.5) * 100}%`,
              }}
            >
              <GlassHighlight
                point={pressHighlight?.target === 'playback' ? pressHighlight : null}
              />
              <IconButton
                label="Previous song"
                src={iconSet.skipBack}
                className="nswl-control"
                onClick={() => changeTrack(-1)}
                pressTarget="playback"
                onPressStart={handlePressStart}
                onPressEnd={handlePressEnd}
                onPressMove={handlePressMove}
                pressOnPointer={false}
                capturePointer
              />
              <IconButton
                label={isPlaying ? 'Pause' : 'Play'}
                src={iconSet.play}
                className="nswl-control nswl-play"
                pressed={isPlaying}
                onClick={togglePlayback}
                pressTarget="playback"
                onPressStart={handlePressStart}
                onPressEnd={handlePressEnd}
                onPressMove={handlePressMove}
                pressOnPointer={false}
                capturePointer
              >
                <PlayPauseIcon iconSet={iconSet} isPlaying={isPlaying} />
              </IconButton>
              <IconButton
                label="Next song"
                src={iconSet.skipForward}
                className="nswl-control"
                onClick={() => changeTrack(1)}
                pressTarget="playback"
                onPressStart={handlePressStart}
                onPressEnd={handlePressEnd}
                onPressMove={handlePressMove}
                pressOnPointer={false}
                capturePointer
              />
            </div>
          </div>
          <IconButton
            label={
              favoriteState === 'plus'
                ? 'Add to favorites'
                : favoriteState === 'star'
                  ? 'Favorite song'
                  : 'Unfavorite song'
            }
            src={
              favoriteState === 'plus'
                ? iconSet.nextBottom
                : favoriteState === 'star'
                  ? iconSet.star
                  : iconSet.starFill
            }
            className="nswl-next-control"
            pressed={favoriteState === 'star-fill'}
            onClick={handleFavoriteToggle}
            pressTarget="queue"
            onPressStart={handlePressStart}
            onPressEnd={handlePressEnd}
            onPressMove={handlePressMove}
            pressing={pressedControl === 'queue'}
            pressScale={pressScale}
            highlight={pressHighlight?.target === 'queue' ? pressHighlight : null}
            dragTransform={pressDrag?.target === 'queue' ? pressDrag : null}
          >
            <FavoriteIcon iconSet={iconSet} state={favoriteState} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
