import { useState } from 'react';
import TabNav from './components/TabNav';
import CardGrid from './components/CardGrid';
import buttonData from './data/buttons';
import './index.css';

const PLACEHOLDER_TABS = ['inputs', 'cards', 'loading', 'more'];

export default function App() {
  const [activeTab, setActiveTab] = useState('buttons');

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1 className="title">Design Explorer</h1>
        <p className="subtitle">Exploring the craft of UI — one element at a time.</p>
      </header>

      {/* Tab Navigation */}
      <TabNav active={activeTab} onChange={setActiveTab} />

      {/* Content */}
      <main className="content">
        {activeTab === 'buttons' && <CardGrid items={buttonData} />}

        {PLACEHOLDER_TABS.includes(activeTab) && (
          <div className="placeholder-page">
            <div className="placeholder-icon">
              <i className="iconfont" style={{ fontSize: '64px', color: '#ccc' }}>{'\ue66d'}</i>
            </div>
            <h2>Coming Soon</h2>
            <p>
              The <strong>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</strong> exploration
              is under construction.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
