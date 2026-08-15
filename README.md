#  Milky Way Galaxy — 3D Visualization

An interactive, procedurally generated 3D Milky Way galaxy built with **Three.js** and **Vite**.

## Features

- Procedurally generated barred spiral galaxy
- Millions of stars with realistic color variation by temperature
- Galactic core with central bulge and bar structure
- Spiral arms with embedded nebulae
- Dark dust clouds
- Stellar halo
- Background stars and deep space
- Sagittarius A* black hole representation
- Interactive camera with orbit, zoom, and pan
- Camera presets (Overview, Center, Spiral Arms, Outer, Top, Side)
- Post-processing bloom effect
- Adjustable controls (rotation, brightness, nebula intensity, dust density, bloom)
- Quality settings (Low, Medium, High, Ultra)
- Responsive design with mobile support
- Keyboard shortcuts
- Loading screen
- FPS counter and star count display

## Quick Start

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Build

```bash
npm run build
npm run preview
```

## Controls

- **Mouse Drag**: Orbit camera
- **Scroll**: Zoom in/out
- **R**: Reset camera
- **P**: Pause/Resume rotation
- **G**: Galaxy Overview
- **C**: Galactic Center
- **I**: Toggle Info panel
- **U**: Toggle UI

## Project Structure

```
src/
  main.js              - Application entry point
  style.css            - Global styles and UI theme
  galaxy/
    Galaxy.js          - Main galaxy assembly
    StarField.js       - Procedural star generation
    GalacticCore.js    - Core, bar, and black hole
    SpiralArms.js      - Spiral arm algorithm
    Nebula.js          - Procedural nebulae
    DustCloud.js       - Dark dust lanes
    GalacticHalo.js    - Faint stellar halo
  scene/
    SceneManager.js    - Scene, camera, renderer, post-processing
  controls/
    CameraControls.js  - OrbitControls + camera presets
  ui/
    ControlPanel.js    - UI controls and info panel
  utils/
    Random.js          - Seeded PRNG utilities
    Noise.js           - Simple noise functions
    ColorUtils.js      - Temperature-to-color mapping
  shaders/
    starVertex.glsl    - Star vertex shader
    starFragment.glsl  - Star fragment shader
    nebulaVertex.glsl  - Nebula vertex shader
    nebulaFragment.glsl - Nebula fragment shader
    dustVertex.glsl    - Dust vertex shader
    dustFragment.glsl  - Dust fragment shader
```

## Technology

- [Three.js](https://threejs.org/) for 3D rendering
- [Vite](https://vitejs.dev/) for bundling and dev server
- Custom GLSL shaders for stars, nebulae, and dust
- `EffectComposer` with `UnrealBloomPass` for cinematic glow

## Performance

- Uses `THREE.Points` with `BufferGeometry` for efficient GPU rendering
- Custom `ShaderMaterial` for per-star color and brightness
- Quality presets adjust star count for different hardware

## Note

This is an artistic/scientific approximation of the Milky Way. Real astronomical data is far more complex.
