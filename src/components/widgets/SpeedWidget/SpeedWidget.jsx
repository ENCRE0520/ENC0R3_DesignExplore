import { useState, useEffect, useRef } from 'react';
import './SpeedWidget.css';

function RollingDigit({ digit }) {
  const [digits, setDigits] = useState([{ id: 0, val: digit }]);
  const nextId = useRef(1);

  useEffect(() => {
    setDigits(prev => {
      if (prev[prev.length - 1].val === digit) return prev;
      return [...prev, { id: nextId.current++, val: digit }];
    });
  }, [digit]);

  useEffect(() => {
    if (digits.length > 1) {
      const timer = setTimeout(() => {
        setDigits(prev => [prev[prev.length - 1]]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [digits]);

  return (
    <span className="rolling-digit-container">
      <span 
        className="rolling-digit-track" 
        style={{ 
          transform: `translateY(-${(digits.length - 1) * 1.4}em)`,
          transition: digits.length > 1 ? 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
        }}
      >
        {digits.map(d => <span key={d.id} className="digit-item">{d.val}</span>)}
      </span>
    </span>
  );
}

function RollingNumber({ value, className = '' }) {
  const strValue = String(value);
  return (
    <span className={`rolling-number ${className}`}>
      {strValue.split('').map((char, i) => {
        if (/[0-9]/.test(char)) {
          return <RollingDigit key={strValue.length - i} digit={char} />;
        }
        return <span key={strValue.length - i} className="digit-static">{char}</span>;
      })}
    </span>
  );
}

export default function SpeedWidget() {
  const [distance, setDistance] = useState(300);
  const [speed, setSpeed] = useState(40);

  useEffect(() => {
    let distanceTimer;
    let speedTimer;

    const tickDistance = () => {
      const delay = 500 + Math.random() * 2000;
      distanceTimer = setTimeout(() => {
        setDistance(d => {
          const decrement = Math.floor(Math.random() * 10) + 5;
          const next = d - decrement;
          return next < 200 ? 350 : next;
        });
        tickDistance();
      }, delay);
    };

    const tickSpeed = () => {
      const delay = 300 + Math.random() * 1500;
      speedTimer = setTimeout(() => {
        setSpeed(s => {
          const change = Math.floor(Math.random() * 5) - 2;
          return Math.min(65, Math.max(25, s + change));
        });
        tickSpeed();
      }, delay);
    };

    tickDistance();
    tickSpeed();

    return () => {
      clearTimeout(distanceTimer);
      clearTimeout(speedTimer);
    };
  }, []);

  return (
    <div className="widget speed-widget">
      <div className="route-arrow" />
      <div className="distance">
        <RollingNumber value={distance} /><span>m</span>
      </div>
      <div className="speed-dial">
        <strong><RollingNumber value={speed} /></strong><small>km/h</small>
      </div>
    </div>
  );
}
