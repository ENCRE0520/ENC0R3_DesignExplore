import './BucketWidget.css';

const bucketItems = [
  'Visit 10 Contries',
  'Explore a national park',
  'Run a marathon',
  'Read 20 Books',
  'Take a cooking class',
  'Start a blog',
  'Learn a new language',
  'Volunteer for a local charity',
];

export default function BucketWidget() {
  return (
    <div className="widget bucket-widget">
      <h3>Day left this year to:</h3>
      <div className="countdown" aria-label="234 days remaining">
        <span>2</span><span>3</span><span>4</span>
      </div>
      <div className="tag-marquee">
        {bucketItems.map((item) => <span key={item}>{item}</span>)}
      </div>
    </div>
  );
}
