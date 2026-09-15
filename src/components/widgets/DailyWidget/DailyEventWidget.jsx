import { useState } from 'react';
import eventAvatar1 from '../../../assets/daily-widget/event-avatar-1.png';
import eventAvatar2 from '../../../assets/daily-widget/event-avatar-2.png';
import eventAvatar3 from '../../../assets/daily-widget/event-avatar-3.png';
import eventAvatar4 from '../../../assets/daily-widget/event-avatar-4.png';
import eventPlus from '../../../assets/daily-widget/event-plus.svg';
import reminderOnIcon from '../../../assets/daily-widget/todo-plus-blue.svg';
import { AvatarStack } from './DailyWidgetShared';
import './DailyWidgets.css';

const eventAvatars = [eventAvatar1, eventAvatar2, eventAvatar3, eventAvatar4];

export default function DailyEventWidget() {
  const [isReminderOn, setReminderOn] = useState(true);

  return (
    <div className="widget daily-event-widget" aria-label="Project Discussion event">
      <div className="daily-event-details">
        <h3>Project Discussion</h3>

        <div className="daily-event-row">
          <div className="daily-event-copy">
            <span>Time</span>
            <strong>20:00-22:00</strong>
          </div>
          <button
            type="button"
            className={`daily-event-action${isReminderOn ? ' daily-event-action--active' : ''}`}
            aria-label={isReminderOn ? 'Turn off time reminder' : 'Turn on time reminder'}
            aria-pressed={isReminderOn}
            onClick={() => setReminderOn((value) => !value)}
          >
            <span className="daily-reminder-icon" aria-hidden="true">
              <img className="daily-reminder-icon-off" src={eventPlus} alt="" draggable={false} />
              <img className="daily-reminder-icon-on" src={reminderOnIcon} alt="" draggable={false} />
            </span>
          </button>
        </div>

        <div className="daily-event-row">
          <div className="daily-event-copy">
            <span>Online Meeting</span>
            <strong>749-556-738</strong>
          </div>
        </div>

        <div className="daily-event-members">
          <span>Member</span>
          <AvatarStack images={eventAvatars} />
        </div>
      </div>
    </div>
  );
}
