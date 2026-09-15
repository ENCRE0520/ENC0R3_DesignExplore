import styles from './Shaders.module.css';

export default function FocusAuroraShader({ isSlowMotion = false }) {
  const motionScale = isSlowMotion ? 10 : 1;

  return (
    <div
      className={`${styles.shaderRoot} ${styles.focusRoot}`}
      style={{ '--motion-scale': motionScale }}
      aria-hidden="true"
    >
      <div className={styles.focusArtwork} />
    </div>
  );
}
