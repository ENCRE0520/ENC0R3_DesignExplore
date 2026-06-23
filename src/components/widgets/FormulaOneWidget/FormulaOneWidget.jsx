import './FormulaOneWidget.css';

export default function FormulaOneWidget() {
  return (
    <div className="widget formula-one-widget" role="img" aria-label="Charles Leclerc, 230 points">
      <img className="formula-one-car" src="/daily-sf25.png" alt="" />

      <div className="formula-one-ferrari-logo" />
      <div className="formula-one-driver">
        <div className="formula-one-driver-name">
          <span className="formula-one-number">16</span>
          <span>Charles <strong>Leclerc</strong></span>
        </div>
        <strong className="formula-one-points">230 PTS</strong>
      </div>
    </div>
  );
}
