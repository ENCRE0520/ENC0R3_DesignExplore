import styles from './Shaders.module.css';

export default function DynamicFieldShader({ isSlowMotion = false }) {
  const motionScale = isSlowMotion ? 10 : 1;

  return (
    <div
      className={`${styles.shaderRoot} ${styles.dynamicRoot}`}
      style={{ '--motion-scale': motionScale }}
      aria-hidden="true"
    >
      <span className={styles.dynamicGradientField} />
      <span className={`${styles.dynamicRipple} ${styles.dynamicRipplePrimary}`} />
      <span className={`${styles.dynamicRipple} ${styles.dynamicRippleSecondary}`} />
    </div>
  );
}
