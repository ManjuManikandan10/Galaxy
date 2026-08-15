import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraController {
  constructor(camera, domElement) {
    this.controls = new OrbitControls(camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 50;
    this.controls.maxDistance = 1200;
    this.controls.enablePan = true;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.15;

    this.presets = {
      overview: { pos: new THREE.Vector3(0, 250, 600), target: new THREE.Vector3(0, 0, 0) },
      center: { pos: new THREE.Vector3(20, 30, 80), target: new THREE.Vector3(0, 0, 0) },
      spiral: { pos: new THREE.Vector3(200, 80, 250), target: new THREE.Vector3(100, 0, 100) },
      outer: { pos: new THREE.Vector3(0, 150, 500), target: new THREE.Vector3(0, 0, 0) },
      top: { pos: new THREE.Vector3(0, 500, 0.1), target: new THREE.Vector3(0, 0, 0) },
      side: { pos: new THREE.Vector3(500, 0, 0.1), target: new THREE.Vector3(0, 0, 0) },
    };
  }

  update() {
    this.controls.update();
  }

  goToPreset(name) {
    const preset = this.presets[name];
    if (!preset) return;

    const startPos = this.controls.object.position.clone();
    const startTarget = this.controls.target.clone();
    const endPos = preset.pos.clone();
    const endTarget = preset.target.clone();
    const duration = 1500;
    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1.0);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.controls.object.position.lerpVectors(startPos, endPos, ease);
      this.controls.target.lerpVectors(startTarget, endTarget, ease);
      this.controls.update();

      if (t < 1.0) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  reset() {
    this.goToPreset('overview');
  }
}
