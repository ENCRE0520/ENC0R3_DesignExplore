import { useLayoutEffect, useRef, useState } from 'react';
import todoAvatar1 from '../../../assets/daily-widget/todo-avatar-1.png';
import todoAvatar2 from '../../../assets/daily-widget/todo-avatar-2.png';
import todoAvatar3 from '../../../assets/daily-widget/todo-avatar-3.png';
import todoAvatar4 from '../../../assets/daily-widget/todo-avatar-4.png';
import todoAvatar5 from '../../../assets/daily-widget/todo-avatar-5.png';
import eventPlus from '../../../assets/daily-widget/event-plus.svg';
import todoPlusBlue from '../../../assets/daily-widget/todo-plus-blue.svg';
import todoVerticalDivider from '../../../assets/daily-widget/todo-vertical-divider.svg';
import { AvatarStack } from './DailyWidgetShared';
import './DailyWidgets.css';

const todoAvatars = [todoAvatar1, todoAvatar2, todoAvatar3, todoAvatar4, todoAvatar5];
const todoItems = [
  'Objectives',
  'Schedule',
  'Design Optimization Plan',
  'Resource Allocation',
  'User Feedback',
];

export default function DailyTodoWidget() {
  const [isReminderOn, setReminderOn] = useState(true);
  const [selectedTodos, setSelectedTodos] = useState([todoItems[0]]);
  const todoListRef = useRef(null);
  const todoPositionsRef = useRef(new Map());
  const orderedTodoItems = [
    ...selectedTodos,
    ...todoItems.filter((item) => !selectedTodos.includes(item)),
  ];

  const handleTodoClick = (item) => {
    todoPositionsRef.current = new Map(
      [...todoListRef.current.querySelectorAll('[data-todo-item]')].map((element) => [
        element.dataset.todoItem,
        element.getBoundingClientRect(),
      ]),
    );
    setSelectedTodos((current) => current.includes(item)
      ? current.filter((selectedItem) => selectedItem !== item)
      : [item, ...current]);
  };

  useLayoutEffect(() => {
    const firstPositions = todoPositionsRef.current;
    const list = todoListRef.current;

    if (!firstPositions.size || !list || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      todoPositionsRef.current = new Map();
      return undefined;
    }

    const movedElements = [];
    list.querySelectorAll('[data-todo-item]').forEach((element) => {
      const first = firstPositions.get(element.dataset.todoItem);
      if (!first) return;

      const last = element.getBoundingClientRect();
      const deltaX = first.left - last.left;
      const deltaY = first.top - last.top;
      if (!deltaX && !deltaY) return;

      element.style.setProperty('transition', 'none');
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      movedElements.push(element);
    });

    todoPositionsRef.current = new Map();
    movedElements.forEach((element) => element.getBoundingClientRect());
    let settleFrame;
    const frame = requestAnimationFrame(() => {
      movedElements.forEach((element) => element.style.removeProperty('transition'));
      settleFrame = requestAnimationFrame(() => {
        movedElements.forEach((element) => element.style.removeProperty('transform'));
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      if (settleFrame) cancelAnimationFrame(settleFrame);
      movedElements.forEach((element) => {
        element.style.removeProperty('transform');
        element.style.removeProperty('transition');
      });
    };
  }, [selectedTodos]);

  return (
    <div className="widget daily-todo-widget" aria-label="Project Discussion tasks">
      <div className="daily-todo-content">
        <div className="daily-todo-header">
          <h3>Project Discussion</h3>
          <div className="daily-todo-reminder-actions">
            <button
              type="button"
              className={`daily-todo-reminder${isReminderOn ? ' daily-todo-reminder--active' : ''}`}
              aria-label={isReminderOn ? 'Turn off reminder' : 'Turn on reminder'}
              aria-pressed={isReminderOn}
              onClick={() => setReminderOn((value) => !value)}
            >
              <span className="daily-reminder-icon" aria-hidden="true">
                <img className="daily-reminder-icon-off" src={eventPlus} alt="" draggable={false} />
                <img className="daily-reminder-icon-on" src={todoPlusBlue} alt="" draggable={false} />
              </span>
              <span className="daily-todo-reminder-label" aria-hidden={!isReminderOn}>Reminder - On</span>
            </button>
          </div>
        </div>

        <div className="daily-todo-event">
          <div className="daily-todo-event-copy">
            <span>Online Meeting</span>
            <strong>749-556-738</strong>
          </div>
          <div className="daily-todo-event-copy daily-todo-event-copy--time">
            <span>Time</span>
            <strong>20:00-22:00</strong>
          </div>
          <AvatarStack images={todoAvatars} variant="wide" />
        </div>

        <div className="daily-todo-panel">
          <div className="daily-todo-summary">
            <div className="daily-todo-count">
              <strong>{todoItems.length}</strong>
              <span>Task</span>
            </div>
            <div className="daily-todo-status">
              <span><b>{selectedTodos.length}</b> Finished</span>
              <span><b>{todoItems.length - selectedTodos.length}</b> Todo</span>
            </div>
          </div>
          <img className="daily-todo-vertical-divider" src={todoVerticalDivider} alt="" draggable={false} />
          <div className="daily-todo-list" ref={todoListRef}>
            {orderedTodoItems.map((item) => (
              <button
                className={selectedTodos.includes(item) ? 'is-active' : ''}
                key={item}
                type="button"
                data-todo-item={item}
                aria-pressed={selectedTodos.includes(item)}
                onClick={() => handleTodoClick(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
