import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = resolve(projectRoot, 'node_modules/@liquid-dom/core/dist');

const makePreviousDrawPatch = (texture) => `(this.device.queue.drawElementImageToTexture
          ? this.device.queue.drawElementImageToTexture(
              { source: entry.html.host },
              {
                texture: ${texture},
                size: { width: entry.deviceWidth, height: entry.deviceHeight }
              }
            )
          : this.device.queue.copyElementImageToTexture
          ? this.device.queue.copyElementImageToTexture(
              { source: entry.html.host },
              {
                destination: { texture: ${texture} },
                width: entry.deviceWidth,
                height: entry.deviceHeight
              }
            )
          : (() => {
              throw new Error("Liquid DOM requires the experimental HTML-in-Canvas API.");
            })())`;

const callSites = [
  {
    legacy: `this.device.queue.copyElementImageToTexture(
          entry.html.host,
          entry.deviceWidth,
          entry.deviceHeight,
          { texture: entry.texture }
        )`,
    currentLegacy: `this.device.queue.copyElementImageToTexture(
          { source: entry.html.host },
          {
            destination: { texture: entry.texture },
            width: entry.deviceWidth,
            height: entry.deviceHeight
          }
        )`,
    previousPatched: `(this.device.queue.copyElementImageToTexture
          ? this.device.queue.copyElementImageToTexture(
              { source: entry.html.host },
              {
                destination: { texture: entry.texture },
                width: entry.deviceWidth,
                height: entry.deviceHeight
              }
            )
          : this.device.queue.copyExternalImageToTexture(
              { source: entry.html.host },
              { texture: entry.texture },
              { width: entry.deviceWidth, height: entry.deviceHeight }
            ))`,
    previousDrawPatched: makePreviousDrawPatch('entry.texture'),
    patched: `(this.device.queue.drawElementImageToTexture
          ? this.device.queue.drawElementImageToTexture(
              { source: entry.html.host },
              {
                texture: entry.texture,
                size: { width: entry.deviceWidth, height: entry.deviceHeight }
              }
            )
          : this.device.queue.copyElementImageToTexture
          ? (() => {
              try {
                return this.device.queue.copyElementImageToTexture(
                  { source: entry.html.host },
                  {
                    destination: { texture: entry.texture },
                    width: entry.deviceWidth,
                    height: entry.deviceHeight
                  }
                );
              } catch (error) {
                if (!(error instanceof TypeError)) throw error;
                try {
                  return this.device.queue.copyElementImageToTexture(
                    entry.html.host,
                    entry.deviceWidth,
                    entry.deviceHeight,
                    { texture: entry.texture }
                  );
                } catch (legacyError) {
                  if (!(legacyError instanceof TypeError)) throw legacyError;
                  return this.device.queue.copyElementImageToTexture(
                    entry.html.host,
                    { texture: entry.texture }
                  );
                }
              }
            })()
          : (() => {
              throw new Error("Liquid DOM requires the experimental HTML-in-Canvas API.");
            })())`,
  },
  {
    legacy: `this.device.queue.copyElementImageToTexture(
          entry.html.host,
          entry.deviceWidth,
          entry.deviceHeight,
          { texture: entry.sourceTexture }
        )`,
    currentLegacy: `this.device.queue.copyElementImageToTexture(
          { source: entry.html.host },
          {
            destination: { texture: entry.sourceTexture },
            width: entry.deviceWidth,
            height: entry.deviceHeight
          }
        )`,
    previousPatched: `(this.device.queue.copyElementImageToTexture
          ? this.device.queue.copyElementImageToTexture(
              { source: entry.html.host },
              {
                destination: { texture: entry.sourceTexture },
                width: entry.deviceWidth,
                height: entry.deviceHeight
              }
            )
          : this.device.queue.copyExternalImageToTexture(
              { source: entry.html.host },
              { texture: entry.sourceTexture },
              { width: entry.deviceWidth, height: entry.deviceHeight }
            ))`,
    previousDrawPatched: makePreviousDrawPatch('entry.sourceTexture'),
    patched: `(this.device.queue.drawElementImageToTexture
          ? this.device.queue.drawElementImageToTexture(
              { source: entry.html.host },
              {
                texture: entry.sourceTexture,
                size: { width: entry.deviceWidth, height: entry.deviceHeight }
              }
            )
          : this.device.queue.copyElementImageToTexture
          ? (() => {
              try {
                return this.device.queue.copyElementImageToTexture(
                  { source: entry.html.host },
                  {
                    destination: { texture: entry.sourceTexture },
                    width: entry.deviceWidth,
                    height: entry.deviceHeight
                  }
                );
              } catch (error) {
                if (!(error instanceof TypeError)) throw error;
                try {
                  return this.device.queue.copyElementImageToTexture(
                    entry.html.host,
                    entry.deviceWidth,
                    entry.deviceHeight,
                    { texture: entry.sourceTexture }
                  );
                } catch (legacyError) {
                  if (!(legacyError instanceof TypeError)) throw legacyError;
                  return this.device.queue.copyElementImageToTexture(
                    entry.html.host,
                    { texture: entry.sourceTexture }
                  );
                }
              }
            })()
          : (() => {
              throw new Error("Liquid DOM requires the experimental HTML-in-Canvas API.");
            })())`,
  },
];

const transparentCanvasConfig = {
  legacy: 'alphaMode: "opaque"',
  current: 'alphaMode: "premultiplied"',
};

const transparentRenderTargets = [
  {
    legacy: 'var OPAQUE_BLACK = { r: 0, g: 0, b: 0, a: 1 };',
    current: 'var OPAQUE_BLACK = { r: 0, g: 0, b: 0, a: 0 };',
  },
  {
    legacy: 'return vec4f(mix(sceneColor.rgb, htmlColor.rgb, htmlAlpha), 1.0);',
    current: 'return vec4f(mix(sceneColor.rgb, htmlColor.rgb, htmlAlpha), max(sceneColor.a, htmlAlpha));',
  },
  {
    legacy: 'return vec4f(mix(background, debugColor, containerOpacity), 1.0);',
    current: 'return vec4f(mix(background, debugColor, containerOpacity), max(backgroundAlpha, fillMask * containerOpacity));',
  },
  {
    legacy: 'return vec4f(mix(background, debugColor, containerOpacity), fillMask * containerOpacity);',
    current: 'return vec4f(mix(background, debugColor, containerOpacity), max(backgroundAlpha, fillMask * containerOpacity));',
  },
  {
    legacy: 'return vec4f(mix(background, color, containerOpacity), 1.0);',
    current: 'return vec4f(mix(background, color, containerOpacity), max(backgroundAlpha, fillMask * containerOpacity));',
  },
  {
    legacy: 'return vec4f(mix(background, color, containerOpacity), fillMask * containerOpacity);',
    current: 'return vec4f(mix(background, color, containerOpacity), max(backgroundAlpha, fillMask * containerOpacity));',
  },
  {
    legacy: 'return vec4f(color, sceneColor.a);',
    current: 'return vec4f(color, max(sceneColor.a, shadowOpacity));',
  },
  {
    legacy: `fn sampleBackgroundSharp(uv: vec2f) -> vec3f {
  return textureSampleLevel(backgroundTextureSharp, backgroundSampler, uv, 0.0).rgb;
}`,
    current: `fn sampleBackgroundSharp(uv: vec2f) -> vec3f {
  return textureSampleLevel(backgroundTextureSharp, backgroundSampler, uv, 0.0).rgb;
}

fn sampleBackgroundAlpha(uv: vec2f) -> f32 {
  return textureSampleLevel(backgroundTextureSharp, backgroundSampler, uv, 0.0).a;
}`,
  },
  {
    legacy: 'let background = sampleBackgroundSharp(in.uv);',
    current: `let background = sampleBackgroundSharp(in.uv);
  let backgroundAlpha = sampleBackgroundAlpha(in.uv);`,
  },
];

for (const filename of ['index.js', 'index.cjs']) {
  const path = resolve(distRoot, filename);
  let source;

  try {
    source = readFileSync(path, 'utf8');
  } catch {
    continue;
  }

  let patched = 0;
  for (const {
    legacy,
    currentLegacy,
    previousPatched,
    previousDrawPatched,
    patched: patchedCall,
  } of callSites) {
    if (source.includes(patchedCall)) {
      continue;
    }
    const match = [previousDrawPatched, previousPatched, currentLegacy, legacy].find((candidate) => (
      source.includes(candidate)
    ));
    if (match) {
      source = source.replace(match, patchedCall);
      patched += 1;
    }
  }

  if (
    !source.includes(transparentCanvasConfig.current)
    && source.includes(transparentCanvasConfig.legacy)
  ) {
    source = source.replace(
      transparentCanvasConfig.legacy,
      transparentCanvasConfig.current,
    );
    patched += 1;
  }

  for (const { legacy, current } of transparentRenderTargets) {
    if (source.includes(current)) {
      continue;
    }
    if (source.includes(legacy)) {
      source = source.replace(legacy, current);
      patched += 1;
    }
  }

  if (patched > 0) {
    writeFileSync(path, source);
    console.log(`Patched @liquid-dom/core ${filename} (${patched} call sites).`);
  }
}
