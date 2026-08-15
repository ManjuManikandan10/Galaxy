import * as THREE from 'three';
import { createSeededRandom } from '../utils/Random.js';
import { temperatureToColor } from '../utils/ColorUtils.js';

export class GalacticHalo {
  constructor(config) {
    this.config = config;
    this.group = new THREE.Group();
  }

  createHalo() {
    const { galaxyRadius, haloStarCount } = this.config;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(haloStarCount * 3);
    const colors = new Float32Array(haloStarCount * 3);
    const sizes = new Float32Array(haloStarCount);
    const brightness = new Float32Array(haloStarCount);

    const rng = createSeededRandom(666);

    for (let i = 0; i < haloStarCount; i++) {
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const r = galaxyRadius * (1.1 + rng() * 0.9);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.35;
      positions[i * 3 + 2] = r * Math.cos(phi);

      const temp = randomRange(rng, 3000, 7000);
      const col = temperatureToColor(temp);
      colors[i * 3] = col.r * 0.7;
      colors[i * 3 + 1] = col.g * 0.7;
      colors[i * 3 + 2] = col.b * 0.7;

      sizes[i] = randomRange(rng, 0.2, 0.8);
      brightness[i] = randomRange(rng, 0.15, 0.45);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('brightness', new THREE.BufferAttribute(brightness, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        attribute float size;
        attribute vec3 customColor;
        attribute float brightness;
        varying vec3 vColor;
        varying float vBrightness;
        void main() {
          vColor = customColor;
          vBrightness = brightness;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (250.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        varying float vBrightness;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float core = 1.0 - smoothstep(0.0, 0.1, dist);
          float glow = 1.0 - smoothstep(0.0, 0.5, dist);
          glow = pow(glow, 3.0);
          vec3 color = vColor * (core * 0.7 + glow * 0.5) * vBrightness;
          float alpha = core * 0.9 + glow * 0.35;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    this.group.add(points);
    return points;
  }
}

function randomRange(rng, min, max) {
  return min + rng() * (max - min);
}
