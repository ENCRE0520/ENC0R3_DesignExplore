import './ExpenseWidget.css';

const dotColors = [
  'pale', 'mid', 'pale', 'hot', 'pale', 'mid', 'hot', 'empty', 'pale',
  'pale', 'mid', 'hot', 'pale', 'pale', 'pale', 'mid', 'pale', 'hot',
  'hot', 'mid', 'pale', 'hot', 'mid', 'pale', 'ring', 'empty', 'empty',
];

export default function ExpenseWidget() {
  return (
    <div className="widget expense-widget">
      <div className="expense-copy">
        <small>Today's Expenses</small>
        <strong><i>$</i>37.25</strong>
        <span>Monthly : $3479.03</span>
      </div>
      <button className="expense-add" aria-label="Add expense">＋</button>
      <div className="expense-calendar" aria-hidden="true">
        {dotColors.map((color, index) => <i className={color} key={`${color}-${index}`} />)}
      </div>
    </div>
  );
}
