const compactCrops = [
  { width: '137.2%', height: '133.42%', left: '-19.59%', top: '-0.44%' },
  { width: '117.79%', height: '117.79%', left: '-8.9%', top: '-3.5%' },
  { width: '107.28%', height: '106.27%', left: '-1.04%', top: '0.87%' },
  { width: '136.96%', height: '150%', left: '-16.95%', top: '-17.74%' },
];

const wideCrops = [
  compactCrops[0],
  { width: '113.03%', height: '113.03%', left: '-6.51%', top: '-1.12%' },
  compactCrops[2],
  compactCrops[3],
  { width: '100%', height: '89.22%', left: '1.28%', top: '8.58%' },
];

export function AvatarStack({ images, variant = 'compact' }) {
  const crops = variant === 'wide' ? wideCrops : compactCrops;

  return (
    <div className={`daily-avatar-stack daily-avatar-stack--${variant}`}>
      {images.map((image, index) => (
        <div className="daily-avatar-shell" key={image} style={{ zIndex: images.length - index + 1 }}>
          <div className="daily-avatar">
            <img className="daily-avatar-image" src={image} alt="" style={crops[index]} draggable={false} />
          </div>
        </div>
      ))}
      <div className="daily-avatar-shell daily-avatar-shell--count" style={{ zIndex: 1 }}>
        <div className="daily-avatar daily-avatar--count">+5</div>
      </div>
    </div>
  );
}
