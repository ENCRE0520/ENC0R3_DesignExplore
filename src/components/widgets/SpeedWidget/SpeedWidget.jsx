import './SpeedWidget.css';

export default function SpeedWidget() {
  return <div className="widget speed-widget">
    <div className="route-arrow" />
    <div className="distance">300<span>m</span></div>
    <div className="speed-dial"><strong>40</strong><small>km/h</small></div>
  </div>;
}
