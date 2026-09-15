import styles from './NextSongCDButton.module.css';

export default function NextSongCDButton({ data, onClick, size = 'default', withContainer = true }) {
  const label = data?.label || 'Next Song';
  const className = [styles.button, size === 'widget' && styles.widget]
    .filter(Boolean)
    .join(' ');
  const button = (
    <button
      className={className}
      type="button"
      aria-label={data?.ariaLabel || label}
      onClick={onClick}
    >
      <span className={styles.label}>{label}</span>
    </button>
  );

  return withContainer ? <div className={styles.shell}>{button}</div> : button;
}
