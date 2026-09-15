import './DeliveryWidget.css';
import deliveryIllustration from '../../../assets/delivery-illustration.svg';

export default function DeliveryWidget() {
  return <div className="widget delivery-widget">
    <div className="delivery-copy">
      <div><small>Your <u>CD player</u> is</small><strong>being sorted.</strong></div>
      <div><small>Delivery in</small><strong>2 days.</strong></div>
    </div>
    <img className="delivery-illustration" src={deliveryIllustration} alt="" aria-hidden="true" draggable={false} />
  </div>;
}
