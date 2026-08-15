import * as THREE from 'three';
import { SceneManager } from './scene/SceneManager.js';
import { CameraController } from './controls/CameraControls.js';
import { ControlPanel } from './ui/ControlPanel.js';
import { Galaxy } from './galaxy/Galaxy.js';
import './style.css';

const CONFIG = {
  galaxyRadius: 500,
  coreRadius: 80,
  barLength: 140,
  spiralArms: 4,
  starCount: 40000,
  armSpread: 0.25,
  diskThickness: 35,
  haloStarCount: 15000,
  rotationSpeed: 0.05,
  starSize: 1.0,
  nebulaCount: 15,
  dustDensity: 0.5,
  bloomStrength: 1.0,
};

let sceneManager, cameraController, controlPanel, galaxy;
let isPaused = false;
let rotationSpeed = CONFIG.rotationSpeed;
let isReady = false;

function init() {
  console.log('[MilkyWay] init started');
  const container = document.getElementById('app');
  if (!container) {
    showError('Error: #app container not found');
    return;
  }

  try {
    console.log('[MilkyWay] Creating SceneManager...');
    sceneManager = new SceneManager(container);
    console.log('[MilkyWay] SceneManager created, canvas size:', sceneManager.renderer.domElement.width, 'x', sceneManager.renderer.domElement.height);

    cameraController = new CameraController(sceneManager.camera, sceneManager.renderer.domElement);
    controlPanel = new ControlPanel(handleControlChange);

    window.addEventListener('resize', onResize);
    document.addEventListener('keydown', onKeyDown);

    console.log('[MilkyWay] Starting animation loop...');
    animate();

    console.log('[MilkyWay] Scheduling galaxy build...');
    setTimeout(() => {
      console.log('[MilkyWay] Building galaxy...');
      buildGalaxy().then(() => {
        console.log('[MilkyWay] Galaxy built, hiding loading...');
        hideLoading();
      }).catch((error) => {
        console.error('[MilkyWay] Build failed:', error);
        hideLoading();
        showError('Galaxy build failed: ' + error.message);
      });
    }, 300);

    setTimeout(() => {
      if (!isReady) {
        console.warn('[MilkyWay] Galaxy not ready after 10s, forcing loading hide');
        hideLoading();
      }
    }, 10000);
  } catch (error) {
    console.error('[MilkyWay] Init error:', error);
    showError('Init failed: ' + error.message);
  }
}

async function buildGalaxy() {
  try {
    console.log('[MilkyWay] Galaxy build started');
    await sleep(50);

    console.log('[MilkyWay] Creating Galaxy instance...');
    galaxy = new Galaxy(CONFIG);
    console.log('[MilkyWay] Building galaxy group...');
    const galaxyGroup = galaxy.build();
    console.log('[MilkyWay] Adding galaxy to scene...');
    sceneManager.scene.add(galaxyGroup);

    await sleep(30);

    if (galaxy.bgPoints) {
      console.log('[MilkyWay] Adding background stars...');
      sceneManager.scene.add(galaxy.bgPoints);
    }

    const totalStars = CONFIG.starCount + 60000 + CONFIG.haloStarCount;
    controlPanel.updateStats(60, totalStars);
    isReady = true;
    console.log('[MilkyWay] Galaxy build complete, isReady=true');
  } catch (error) {
    console.error('[MilkyWay] Galaxy build error:', error);
    showError('Galaxy build failed: ' + error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function hideLoading() {
  console.log('[MilkyWay] hideLoading called');
  const loading = document.getElementById('loading');
  if (loading) {
    loading.classList.add('hidden');
    setTimeout(() => {
      if (loading.parentNode) loading.parentNode.removeChild(loading);
    }, 800);
  }
}

function showError(message) {
  console.error('[MilkyWay]', message);
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position:fixed;top:20px;left:20px;right:20px;background:rgba(255,0,0,0.2);color:#ff9999;padding:15px;border-radius:8px;font-family:monospace;z-index:9999;max-width:600px;';
  errorDiv.textContent = 'Error: ' + message;
  document.body.appendChild(errorDiv);
}

function handleControlChange(key, value) {
  switch (key) {
    case 'preset':
      cameraController.goToPreset(value);
      break;
    case 'pause':
      isPaused = !isPaused;
      break;
    case 'rotationSpeed':
      rotationSpeed = value;
      break;
    case 'brightness':
      break;
    case 'nebulaIntensity':
      if (galaxy && galaxy.nebulaSprites) {
        galaxy.nebulaSprites.forEach((sprite) => {
          if (sprite.material) {
            sprite.material.opacity = value * 0.4;
          }
        });
      }
      break;
    case 'dustDensity':
      if (galaxy && galaxy.dustPoints && galaxy.dustPoints.material.uniforms) {
        galaxy.dustPoints.material.uniforms.uDensity.value = value;
      }
      break;
    case 'bloom':
      if (sceneManager.bloomPass) {
        sceneManager.bloomPass.strength = value * 0.02;
      }
      break;
    case 'quality':
      handleQualityChange(value);
      break;
  }
}

function handleQualityChange(quality) {
  const qualityMap = {
    low: 40000,
    medium: 80000,
    high: 150000,
    ultra: 250000,
  };

  const newCount = qualityMap[quality] || 80000;
  if (newCount !== CONFIG.starCount) {
    CONFIG.starCount = newCount;
    if (galaxy) {
      const oldGroup = galaxy.getGroup();
      const oldBgPoints = galaxy.bgPoints;
      sceneManager.scene.remove(oldGroup);
      if (oldBgPoints) sceneManager.scene.remove(oldBgPoints);
      oldGroup.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      });
    }
    buildGalaxy();
  }
}

function onResize() {
  sceneManager.resize();
}

function onKeyDown(e) {
  switch (e.key.toLowerCase()) {
    case 'r':
      cameraController.reset();
      break;
    case 'p':
      isPaused = !isPaused;
      break;
    case 'g':
      cameraController.goToPreset('overview');
      break;
    case 'c':
      cameraController.goToPreset('center');
      break;
    case 'i':
      const info = document.getElementById('info-panel');
      if (info) info.style.display = info.style.display === 'none' ? 'block' : 'none';
      break;
    case 'u':
      controlPanel.toggle();
      break;
  }
}

let lastTime = performance.now();
let frameCount = 0;
let fps = 60;
let hasRenderedGalaxy = false;

function animate() {
  requestAnimationFrame(animate);

  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastTime = now;
    const totalStars = CONFIG.starCount + 60000 + CONFIG.haloStarCount;
    controlPanel.updateStats(fps, totalStars);
  }

  if (!isPaused && isReady && galaxy) {
    const delta = sceneManager.getDelta();
    galaxy.getGroup().rotation.y += rotationSpeed * delta;
    if (!hasRenderedGalaxy) {
      hasRenderedGalaxy = true;
      console.log('[MilkyWay] First galaxy frame rendered');
      setTimeout(hideLoading, 100);
    }
  }

  cameraController.update();
  sceneManager.render();
}

init();
