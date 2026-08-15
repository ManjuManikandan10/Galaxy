import * as THREE from 'three';
import { createSeededRandom, randomNormal, randomRange } from '../utils/Random.js';

export class GalacticCore {
  constructor(config) {
    this.config = config;
    this.group = new THREE.Group();
  }

  createCore() {
    const { coreRadius, barLength } = this.config;
    const rng = createSeededRandom(999);

    const coreGeometry = new THREE.BufferGeometry();
    const coreCount = 80000;
    const positions = new Float32Array(coreCount * 3);
    const colors = new Float32Array(coreCount * 3);
    const sizes = new Float32Array(coreCount);
    const brightness = new Float32Array(coreCount);

    for (let i = 0; i < coreCount; i++) {
      const r = Math.abs(randomNormal(rng, 0, coreRadius * 0.35));
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
      positions[i * 3 + 2] = r * Math.cos(phi);

      const warmth = 1.0 - r / coreRadius;
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.7 + warmth * 0.25;
      colors[i * 3 + 2] = 0.4 + warmth * 0.3;

      sizes[i] = randomRange(rng, 1.5, 4.0);
      brightness[i] = randomRange(rng, 0.9, 1.3);
    }

    coreGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    coreGeometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    coreGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    coreGeometry.setAttribute('brightness', new THREE.BufferAttribute(brightness, 1));

    const coreMaterial = new THREE.ShaderMaterial({
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
          gl_PointSize = size * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        varying float vBrightness;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float core = 1.0 - smoothstep(0.0, 0.08, dist);
          float glow = 1.0 - smoothstep(0.0, 0.5, dist);
          glow = pow(glow, 2.5);
          vec3 color = vColor * (core * 0.8 + glow * 0.6) * vBrightness;
          float alpha = core * 0.95 + glow * 0.4;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const corePoints = new THREE.Points(coreGeometry, coreMaterial);
    this.group.add(corePoints);

    const glowGeometry = new THREE.SphereGeometry(coreRadius * 0.6, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(1.0, 0.8, 0.5),
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    this.group.add(glowMesh);

    const glow2Geometry = new THREE.SphereGeometry(coreRadius * 0.35, 32, 32);
    const glow2Material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(1.0, 0.9, 0.7),
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const glow2Mesh = new THREE.Mesh(glow2Geometry, glow2Material);
    this.group.add(glow2Mesh);

    return corePoints;
  }

  createBar() {
    const { barLength, coreRadius } = this.config;
    const rng = createSeededRandom(888);

    const barGeometry = new THREE.BufferGeometry();
    const barCount = 40000;
    const positions = new Float32Array(barCount * 3);
    const colors = new Float32Array(barCount * 3);
    const sizes = new Float32Array(barCount);
    const brightness = new Float32Array(barCount);

    for (let i = 0; i < barCount; i++) {
      const t = randomRange(rng, -1, 1);
      const barR = Math.abs(t) * barLength;
      const perp = randomNormal(rng, 0, barLength * 0.2);
      const y = randomNormal(rng, 0, coreRadius * 0.4);

      positions[i * 3] = barR * Math.sign(t);
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = perp;

      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.75;
      colors[i * 3 + 2] = 0.5;

      sizes[i] = randomRange(rng, 1.0, 3.0);
      brightness[i] = randomRange(rng, 0.7, 1.1);
    }

    barGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    barGeometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    barGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    barGeometry.setAttribute('brightness', new THREE.BufferAttribute(brightness, 1));

    const barMaterial = new THREE.ShaderMaterial({
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
          gl_PointSize = size * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        varying float vBrightness;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float core = 1.0 - smoothstep(0.0, 0.08, dist);
          float glow = 1.0 - smoothstep(0.0, 0.5, dist);
          glow = pow(glow, 2.5);
          vec3 color = vColor * (core * 0.8 + glow * 0.6) * vBrightness;
          float alpha = core * 0.9 + glow * 0.35;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const barPoints = new THREE.Points(barGeometry, barMaterial);
    this.group.add(barPoints);
    return barPoints;
  }

  createBlackHole() {
    const group = new THREE.Group();

    const accretionGeometry = new THREE.RingGeometry(3, 8, 64);
    const accretionMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(1.0, 0.6, 0.2),
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const accretion = new THREE.Mesh(accretionGeometry, accretionMaterial);
    accretion.rotation.x = Math.PI / 2;
    group.add(accretion);

    const shadowGeometry = new THREE.SphereGeometry(2, 32, 32);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0.0, 0.0, 0.0),
    });
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    group.add(shadow);

    const glowGeometry = new THREE.SphereGeometry(4, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0.8, 0.4, 0.1),
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);

    this.group.add(group);
    return group;
  }
}
