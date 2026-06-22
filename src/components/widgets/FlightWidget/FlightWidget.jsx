import './FlightWidget.css';

export default function FlightWidget() {
  return (
    <div className="widget flight-widget">
      <div className="sky"><div className="wing" /></div>
      <div className="boarding-card">
        <div className="flight-main">
          <div><small>17:20PM</small><strong>SKY</strong><span>Lakeside</span></div>
          <div className="flight-path">
            <div className="path-visual">
              <span>●</span>
              <span className="line">─</span>
              <i className="iconfont icon-send-01" />
              <span className="line">─</span>
              <span>●</span>
            </div>
            <small>3h25min</small>
          </div>
          <div><small>08:20AM</small><strong>NXT</strong><span>Harborview</span></div>
        </div>
        <div className="flight-details">
          <span><small>Check-in</small>J, K</span>
          <span><small>Boarding</small>165</span>
          <span><small>Class</small>Economy</span>
        </div>
      </div>
    </div>
  );
}
