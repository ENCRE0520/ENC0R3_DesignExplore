import { useRef } from 'react';
import weatherBackground from '../../../assets/weather-widget/weather-background-2.jpeg?inline';
import sunsetIcon from '../../../assets/weather-widget/weather-icon-1.svg?inline';
import WeatherGlassOverlay from './WeatherGlassOverlay';
import useWeatherParallax from './useWeatherParallax';
import './WeatherWidget.css';

function WeatherVisual() {
  return (
    <>
      <img
        className="weather-widget-background"
        src={weatherBackground}
        alt=""
        aria-hidden="true"
        draggable={false}
      />

      <div className="weather-widget-reading">
        <div className="weather-widget-sunset">
          <img
            className="weather-widget-sunset-icon"
            src={sunsetIcon}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
          <span>Sunset 1hrs</span>
        </div>
        <strong>37°</strong>
      </div>
    </>
  );
}

export default function WeatherWidget({
  isExpanded = false,
  isActive = true,
  parallaxBoundaryRef,
  isWebGPUSupported = true,
  onCompatibilityError,
}) {
  const glassRef = useRef(null);
  const { widgetRef } = useWeatherParallax({
    boundaryRef: parallaxBoundaryRef,
    isExpanded,
    onParallaxChange: () => glassRef.current?.invalidateFrame(),
  });

  return (
    <div
      ref={widgetRef}
      className="widget weather-widget"
      aria-label="37 degrees, sunset in 1 hour"
    >
      <div className="weather-widget-face">
        <WeatherGlassOverlay
          ref={glassRef}
          isActive={isActive}
          isWebGPUSupported={isWebGPUSupported}
          onCompatibilityError={onCompatibilityError}
        >
          <WeatherVisual />
        </WeatherGlassOverlay>
      </div>
    </div>
  );
}
