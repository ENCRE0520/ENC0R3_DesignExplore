import Card from './Card';

export default function CardGrid({ items }) {
  return (
    <div className="card-grid">
      {items.map((item) => (
        <Card key={item.id} data={item} />
      ))}
    </div>
  );
}
