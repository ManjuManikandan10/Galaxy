import * as THREE from 'three';
import { createSeededRandom } from '../utils/Random.js';

export class DustCloud {
  constructor(config) {
    this.config = config;
    this.group = new THREE.Group();
  }

  createDust() {
    const { galaxyRadius, dustDensity, barLength, coreRadius, spiralArms } = this.config;
    const dustCount = Math.floor(galaxyRadius * dustDensity * 15);
    const positions = new Float32Array(dustCount * 3);
    const alphas = new Float32Array(dustCount);
    const sizes = new Float32Array(dustCount);

    const rng = createSeededRandom(333);

    for (let i = 0; i < dustCount; i++) {
      const armIndex = Math.floor(rng() * spiralArms);
      const armAngle = (armIndex / spiralArms) * Math.PI * 2;
      const radius = 10 + Math.pow(rng(), 0.5) * galaxyRadius * 0.8;
      const spiralAngle = armAngle + radius * 0.009;
      const scatter = randomNormal(rng, 0, radius * 0.18);

      const x = radius * Math.cos(spiralAngle) + scatter * Math.cos(spiralAngle + Math.PI / 2);
      const z = radius * Math.sin(spiralAngle) + scatter * Math.sin(spiralAngle + Math.PI / 2);
      const y = randomNormal(rng, 0, 10);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      alphas[i] = randomRange(rng, 0.1, 0.6);
      sizes[i] = randomRange(rng, 8, 40);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        attribute float size;
        attribute float alpha;
        uniform float uDensity;
        varying float vAlpha;
        void main() {
          vAlpha = alpha * uDensity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, dist) * vAlpha * 0.35;
          gl_FragColor = vec4(0.04, 0.02, 0.01, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uDensity: { value: 1.0 }
      }
    });

    const points = new THREE.Points(geometry, material);
    this.group.add(points);
    this.points = points;
    return points;
  }
}

function randomNormal(rng, mean, stdDev) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return mean + Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev;
}

function randomRange(rng, min, max) {
  return min + rng() * (max - min);
}
