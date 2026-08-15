import * as THREE from 'three';
import { createSeededRandom, randomRange, randomNormal } from '../utils/Random.js';
import { temperatureToColor, randomTemperature } from '../utils/ColorUtils.js';

const starVertexShader = /* glsl */ `
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
`;

const starFragmentShader = /* glsl */ `
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
`;

export class StarField {
  constructor(config) {
    this.config = config;
    this.group = new THREE.Group();
  }

  createBackgroundStars(count, radius) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const brightness = new Float32Array(count);

    const rng = createSeededRandom(12345);

    for (let i = 0; i < count; i++) {
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const r = radius * (0.8 + rng() * 0.4);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const temp = randomTemperature(rng);
      const col = temperatureToColor(temp);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = randomRange(rng, 0.5, 2.0);
      brightness[i] = randomRange(rng, 0.3, 1.0);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('brightness', new THREE.BufferAttribute(brightness, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    this.group.add(points);
    return points;
  }

  createGalaxyStars(config) {
    const geometry = new THREE.BufferGeometry();
    const totalStars = config.starCount;
    const positions = new Float32Array(totalStars * 3);
    const colors = new Float32Array(totalStars * 3);
    const sizes = new Float32Array(totalStars);
    const brightness = new Float32Array(totalStars);

    const rng = createSeededRandom(42);
    const { galaxyRadius, coreRadius, barLength, spiralArms, armSpread, diskThickness } = config;

    const coreCount = Math.floor(totalStars * 0.15);
    const barCount = Math.floor(totalStars * 0.1);
    const armCount = Math.floor(totalStars * 0.55);
    const diskCount = Math.floor(totalStars * 0.15);
    const haloCount = totalStars - coreCount - barCount - armCount - diskCount;

    let idx = 0;

    for (let i = 0; i < coreCount; i++) {
      const r = randomNormal(rng, 0, coreRadius * 0.4);
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const rr = Math.abs(r);

      positions[idx * 3] = rr * Math.sin(phi) * Math.cos(theta);
      positions[idx * 3 + 1] = rr * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[idx * 3 + 2] = rr * Math.cos(phi);

      const temp = randomRange(rng, 4000, 10000);
      const col = temperatureToColor(temp);
      colors[idx * 3] = col.r;
      colors[idx * 3 + 1] = col.g;
      colors[idx * 3 + 2] = col.b;

      sizes[idx] = randomRange(rng, 1.0, 3.5);
      brightness[idx] = randomRange(rng, 0.8, 1.2);
      idx++;
    }

    for (let i = 0; i < barCount; i++) {
      const t = randomRange(rng, -1, 1);
      const barR = Math.abs(t) * barLength;
      const perp = randomNormal(rng, 0, barLength * 0.2);
      const y = randomNormal(rng, 0, diskThickness * 0.5);

      positions[idx * 3] = barR * Math.sign(t);
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = perp;

      const temp = randomRange(rng, 4500, 9000);
      const col = temperatureToColor(temp);
      colors[idx * 3] = col.r;
      colors[idx * 3 + 1] = col.g;
      colors[idx * 3 + 2] = col.b;

      sizes[idx] = randomRange(rng, 1.0, 3.0);
      brightness[idx] = randomRange(rng, 0.7, 1.1);
      idx++;
    }

    for (let i = 0; i < armCount; i++) {
      const armIndex = Math.floor(rng() * spiralArms);
      const armAngle = (armIndex / spiralArms) * Math.PI * 2;

      const radius = Math.pow(rng(), 0.6) * galaxyRadius;
      const spiralAngle = armAngle + radius * 0.008 + randomNormal(rng, 0, armSpread * radius * 0.3);
      const scatter = randomNormal(rng, 0, radius * 0.15);

      const x = radius * Math.cos(spiralAngle) + scatter * Math.cos(spiralAngle + Math.PI / 2);
      const z = radius * Math.sin(spiralAngle) + scatter * Math.sin(spiralAngle + Math.PI / 2);
      const y = randomNormal(rng, 0, diskThickness * (0.3 + radius / galaxyRadius * 0.7));

      positions[idx * 3] = x;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = z;

      const distFromCenter = radius / galaxyRadius;
      let temp;
      if (distFromCenter < 0.3) {
        temp = randomRange(rng, 5000, 12000);
      } else if (distFromCenter < 0.7) {
        temp = randomRange(rng, 6000, 20000);
      } else {
        temp = randomRange(rng, 3000, 8000);
      }
      const col = temperatureToColor(temp);
      colors[idx * 3] = col.r;
      colors[idx * 3 + 1] = col.g;
      colors[idx * 3 + 2] = col.b;

      sizes[idx] = randomRange(rng, 0.8, 2.5);
      brightness[idx] = randomRange(rng, 0.6, 1.0);
      idx++;
    }

    for (let i = 0; i < diskCount; i++) {
      const radius = Math.pow(rng(), 0.5) * galaxyRadius;
      const angle = rng() * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = randomNormal(rng, 0, diskThickness * 0.3);

      positions[idx * 3] = x;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = z;

      const temp = randomRange(rng, 3000, 7000);
      const col = temperatureToColor(temp);
      colors[idx * 3] = col.r;
      colors[idx * 3 + 1] = col.g;
      colors[idx * 3 + 2] = col.b;

      sizes[idx] = randomRange(rng, 0.5, 1.5);
      brightness[idx] = randomRange(rng, 0.4, 0.8);
      idx++;
    }

    for (let i = 0; i < haloCount; i++) {
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const r = galaxyRadius * (1.2 + rng() * 0.8);

      positions[idx * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[idx * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
      positions[idx * 3 + 2] = r * Math.cos(phi);

      const temp = randomRange(rng, 3000, 6000);
      const col = temperatureToColor(temp);
      colors[idx * 3] = col.r;
      colors[idx * 3 + 1] = col.g;
      colors[idx * 3 + 2] = col.b;

      sizes[idx] = randomRange(rng, 0.3, 1.2);
      brightness[idx] = randomRange(rng, 0.2, 0.6);
      idx++;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('brightness', new THREE.BufferAttribute(brightness, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    this.group.add(points);
    return points;
  }

  getGroup() {
    return this.group;
  }
}
