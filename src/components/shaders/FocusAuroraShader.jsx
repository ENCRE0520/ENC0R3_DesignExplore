import { useEffect, useState } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';
import styles from './Shaders.module.css';

export default function FocusAuroraShader({ isSlowMotion = false }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(query.matches);

    updatePreference();
    query.addEventListener('change', updatePreference);
    return () => query.removeEventListener('change', updatePreference);
  }, []);

  const speed = prefersReducedMotion ? 0 : (isSlowMotion ? 0.1 : 1);

  return (
    <div className={`${styles.shaderRoot} ${styles.focusRoot}`} aria-hidden="true">
      <MeshGradient
        aria-hidden="true"
        className={styles.focusMeshGradient}
        colors={['#7f9fff', '#9eaaf2', '#d7d4e6', '#f0edf1', '#e2dce7', '#cbc3d4']}
        distortion={0.68}
        frame={3700}
        grainMixer={0}
        grainOverlay={0}
        maxPixelCount={10000}
        minPixelRatio={1}
        rotation={197}
        speed={speed}
        style={{ height: '100%', width: '100%' }}
        swirl={0.16}
        webGlContextAttributes={{
          alpha: true,
          antialias: false,
          depth: false,
          powerPreference: 'low-power',
          stencil: false,
        }}
      />
    </div>
  );
}
