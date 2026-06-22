import './FlameWidget.css';

const flame = [
  '0000110000',
  '0000100000',
  '0001000000',
  '0001100000',
  '0001110000',
  '0011111000',
  '0011111000',
  '0111111100',
  '0111111100',
  '1111111110',
].join('');

export default function FlameWidget() {
  return (
    <div className="widget flame-widget" aria-label="Pixel flame">
      {[...flame].map((isLit, index) => (
        <i
          key={index}
          className={isLit === '1' ? `on l${Math.abs((index % 10) - 5)}` : ''}
        />
      ))}
    </div>
  );
}
