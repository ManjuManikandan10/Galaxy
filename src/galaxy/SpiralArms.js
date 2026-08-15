import * as THREE from 'three';
import { createSeededRandom } from '../utils/Random.js';
import { temperatureToColor } from '../utils/ColorUtils.js';

export class SpiralArms {
  constructor(config) {
    this.config = config;
    this.group = new THREE.Group();
  }

  createArms() {
    const { galaxyRadius, spiralArms, armSpread, diskThickness, starCount } = this.config;
    const starsPerArm = Math.floor(starCount * 0.55 / spiralArms);
    const allPositions = [];
    const allColors = [];
    const allSizes = [];
    const allBrightness = [];

    for (let arm = 0; arm < spiralArms; arm++) {
      const armAngle = (arm / spiralArms) * Math.PI * 2;
      const armRng = createSeededRandom(arm * 1000 + 777);

      for (let i = 0; i < starsPerArm; i++) {
        const radius = Math.pow(armRng(), 0.55) * galaxyRadius;
        const spiralAngle = armAngle + radius * 0.009;
        const scatter = randomNormal(armRng, 0, radius * 0.12);

        const x = radius * Math.cos(spiralAngle) + scatter * Math.cos(spiralAngle + Math.PI / 2);
        const z = radius * Math.sin(spiralAngle) + scatter * Math.sin(spiralAngle + Math.PI / 2);
        const y = randomNormal(armRng, 0, diskThickness * (0.25 + radius / galaxyRadius * 0.75));

        allPositions.push(x, y, z);

        const distFromCenter = radius / galaxyRadius;
        let temp;
        if (distFromCenter < 0.3) {
          temp = randomRange(armRng, 5000, 12000);
        } else if (distFromCenter < 0.7) {
          temp = randomRange(armRng, 7000, 22000);
        } else {
          temp = randomRange(armRng, 4000, 10000);
        }
        const col = temperatureToColor(temp);
        allColors.push(col.r, col.g, col.b);
        allSizes.push(randomRange(armRng, 0.8, 2.5));
        allBrightness.push(randomRange(armRng, 0.6, 1.0));
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(allPositions, 3));
    geometry.setAttribute('customColor', new THREE.Float32BufferAttribute(allColors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(allSizes, 1));
    geometry.setAttribute('brightness', new THREE.Float32BufferAttribute(allBrightness, 1));

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
