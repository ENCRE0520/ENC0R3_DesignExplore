import './DeliveryWidget.css';

export default function DeliveryWidget() {
  return <div className="widget delivery-widget">
    <div className="delivery-copy">
      <div><small>Your <u>CD player</u> is</small><strong>being sorted.</strong></div>
      <div><small>Delivery in</small><strong>2 days.</strong></div>
    </div>
    <div className="conveyor"><i/><i/><i/><i/><i/></div>
    <div className="parcel"><span/><b/></div>
  </div>;
}
