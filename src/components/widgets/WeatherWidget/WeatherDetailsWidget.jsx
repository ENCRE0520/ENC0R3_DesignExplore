import { useRef } from 'react';
import weatherBackground from '../../../assets/weather-widget/weather-background-2.jpeg?inline';
import WeatherGlassOverlay from './WeatherGlassOverlay';
import useWeatherParallax from './useWeatherParallax';
import './WeatherWidget.css';

function WeatherDetailsVisual() {
  return (
    <>
      <img
        className="weather-widget-background"
        src={weatherBackground}
        alt=""
        aria-hidden="true"
        draggable={false}
      />

      <div className="weather-details-reading">
        <div className="weather-details-row">
          <span className="weather-details-primary">37°</span>
          <span className="weather-details-muted">now</span>
        </div>
        <div className="weather-details-row">
          <span className="weather-details-muted">in</span>
          <span className="weather-details-primary">Twin Peaks</span>
        </div>
        <div className="weather-details-row">
          <span className="weather-details-muted">feels</span>
          <span className="weather-details-primary">41°</span>
        </div>
        <div className="weather-details-row">
          <span className="weather-details-primary">sunset</span>
          <span className="weather-details-muted">next</span>
        </div>
        <div className="weather-details-row">
          <span className="weather-details-primary">1</span>
          <span className="weather-details-muted">hours</span>
        </div>
      </div>
    </>
  );
}

export default function WeatherDetailsWidget({
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
      aria-label="37 degrees now in Twin Peaks, feels like 41 degrees, sunset in 1 hour"
    >
      <div className="weather-widget-face weather-widget-face--details">
        <WeatherGlassOverlay
          ref={glassRef}
          details
          isActive={isActive}
          isWebGPUSupported={isWebGPUSupported}
          onCompatibilityError={onCompatibilityError}
        >
          <WeatherDetailsVisual />
        </WeatherGlassOverlay>
      </div>
    </div>
  );
}
