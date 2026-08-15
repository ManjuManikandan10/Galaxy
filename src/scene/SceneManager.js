import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth || window.innerWidth;
    this.height = container.clientHeight || window.innerHeight;

    const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
    if (!gl) {
      container.innerHTML = '<div style="color:#ff9999;text-align:center;margin-top:40vh;font-family:sans-serif;padding:20px;"><h2>WebGL Not Supported</h2><p>Your browser does not support WebGL, which is required for this application.</p><p>Please try a modern browser like Chrome, Firefox, or Edge.</p></div>';
      throw new Error('WebGL not supported');
    }

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000005);

    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 3000);
    this.camera.position.set(0, 200, 500);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    this.setupPostProcessing();
    this.setupLights();
  }

  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      1.2,
      0.4,
      0.85
    );
    this.composer.addPass(this.bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0x111122, 0.5);
    this.scene.add(ambientLight);
  }

  resize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
  }

  render() {
    this.composer.render();
  }

  getDelta() {
    return this.clock.getDelta();
  }

  getElapsed() {
    return this.clock.getElapsedTime();
  }
}
