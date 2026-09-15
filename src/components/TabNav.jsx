export default function TabNav({ items, active, onChange }) {
  return (
    <nav className="tab-nav" aria-label="Exploration categories">
      <div className="tab-list">
        {items.map((item) => (
          <button
            key={item.id}
            className={`tab-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onChange(item.id)}
            type="button"
            aria-current={active === item.id ? 'page' : undefined}
          >
            {item.label}
            {active === item.id && <span className="active-dot" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </nav>
  );
}
