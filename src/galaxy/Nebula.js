import * as THREE from 'three';
import { createSeededRandom } from '../utils/Random.js';

export class Nebula {
  constructor(config) {
    this.config = config;
    this.group = new THREE.Group();
    this.sprites = [];
  }

  createNebulae() {
    const { galaxyRadius, nebulaCount } = this.config;
    const rng = createSeededRandom(555);

    const nebulaColors = [
      new THREE.Color(0.8, 0.2, 0.3),
      new THREE.Color(0.6, 0.1, 0.5),
      new THREE.Color(0.2, 0.3, 0.7),
      new THREE.Color(0.1, 0.5, 0.7),
      new THREE.Color(0.7, 0.3, 0.5),
      new THREE.Color(0.3, 0.2, 0.6),
    ];

    for (let n = 0; n < nebulaCount; n++) {
      const armIndex = Math.floor(rng() * 4);
      const armAngle = (armIndex / 4) * Math.PI * 2;
      const radius = 30 + Math.pow(rng(), 0.7) * (galaxyRadius * 0.7);
      const spiralAngle = armAngle + radius * 0.009;
      const scatter = randomNormal(rng, 0, radius * 0.2);

      const x = radius * Math.cos(spiralAngle) + scatter * Math.cos(spiralAngle + Math.PI / 2);
      const z = radius * Math.sin(spiralAngle) + scatter * Math.sin(spiralAngle + Math.PI / 2);
      const y = randomNormal(rng, 0, 15);

      const color = nebulaColors[Math.floor(rng() * nebulaColors.length)];
      const size = 15 + rng() * 60;
      const opacity = 0.08 + rng() * 0.25;

      const spriteMaterial = new THREE.SpriteMaterial({
        map: this.createNebulaTexture(color, size),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: opacity,
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(x, y, z);
      sprite.scale.set(size * 2, size * 2, 1);
      this.group.add(sprite);
      this.sprites.push(sprite);
    }

    return this.sprites;
  }

  createNebulaTexture(color, size) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 0.8)`);
    gradient.addColorStop(0.3, `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 0.4)`);
    gradient.addColorStop(0.6, `rgba(${Math.floor(color.r * 200)}, ${Math.floor(color.g * 150)}, ${Math.floor(color.b * 180)}, 0.15)`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
}

function randomNormal(rng, mean, stdDev) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return mean + Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev;
}
