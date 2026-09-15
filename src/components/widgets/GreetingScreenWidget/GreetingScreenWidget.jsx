import { useEffect, useState } from 'react';
import './GreetingScreenWidget.css';

const MESSAGES = ['Hello', ':-)', 'Hi there!', '(^_^)', 'Howdy!', '<3'];

export default function GreetingScreenWidget() {
  const [message, setMessage] = useState(MESSAGES[0]);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    let messageIndex = 0;
    let position = MESSAGES[0].length;
    let deleting = true;
    let timerId;

    const tick = () => {
      let typedComplete = false;

      if (deleting) {
        position -= 1;
        setMessage(MESSAGES[messageIndex].slice(0, position));
        if (position === 0) {
          messageIndex = (messageIndex + 1) % MESSAGES.length;
          deleting = false;
        }
      } else {
        position += 1;
        setMessage(MESSAGES[messageIndex].slice(0, position));
        typedComplete = position === MESSAGES[messageIndex].length;
        if (typedComplete) deleting = true;
      }

      const delay = position === 0 ? 400 : typedComplete ? 1300 : deleting ? 85 : 115;
      timerId = window.setTimeout(tick, delay);
    };

    timerId = window.setTimeout(tick, 1500);
    return () => window.clearTimeout(timerId);
  }, []);

  return (
    <div className="widget greeting-screen-widget" role="img" aria-label="Animated greeting screen">
      <div className="greeting-screen-body" aria-hidden="true">
        <div className="greeting-screen-bezel">
          <div className="greeting-screen-display"><span>{message}</span></div>
        </div>
        <div className="greeting-screen-comp">COMP</div>
        <div className="greeting-screen-slot"><i /></div>
      </div>
    </div>
  );
}
