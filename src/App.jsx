import { useState } from 'react';
import TabNav from './components/TabNav';
import CardGrid from './components/CardGrid';
import buttonData from './data/buttons';
import widgetData from './data/widgets';
import shaderData from './data/shaders';
import { categories } from './data/taxonomy';
import './index.css';

const explorations = [...buttonData, ...widgetData, ...shaderData];

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const category = categories.find((item) => item.id === activeCategory) || categories[0];
  const filteredExplorations = explorations.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory,
  );

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  return (
    <div className="app">
      <header className="sidebar">
        <h1 className="title">Design Explorer</h1>
        <TabNav items={categories} active={activeCategory} onChange={handleCategoryChange} />
      </header>

      <main className="content" id="exploration-content">
        {filteredExplorations.length > 0 ? (
          <CardGrid items={filteredExplorations} />
        ) : (
          <section className="empty-state" aria-labelledby="empty-state-title">
            <h3 id="empty-state-title">No {category.label.toLowerCase()} yet.</h3>
            <p>
              This space is ready for the first study that belongs here.
            </p>
            <button type="button" onClick={() => handleCategoryChange('all')}>
              View All Explorations
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
