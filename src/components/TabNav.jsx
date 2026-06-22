const tabs = [
  { id: 'buttons', label: 'Buttons' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'cards', label: 'Cards' },
  { id: 'loading', label: 'Loading' },
  { id: 'more', label: 'More' },
];

export default function TabNav({ active, onChange }) {
  return (
    <nav className="tab-nav">
      <div className="tab-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${active === tab.id ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
