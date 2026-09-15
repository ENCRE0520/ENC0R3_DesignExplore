import styles from './Shaders.module.css';

export default function RelationshipFlowShader({ isSlowMotion = false }) {
  const motionScale = isSlowMotion ? 10 : 1;

  return (
    <div
      className={`${styles.shaderRoot} ${styles.relationshipRoot}`}
      style={{ '--motion-scale': motionScale }}
      aria-hidden="true"
    >
      <span className={styles.relationshipGradientFlow} />
    </div>
  );
}
