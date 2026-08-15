export class ControlPanel {
  constructor(onChange) {
    this.onChange = onChange;
    this.isVisible = true;
    this.panel = this.createUI();
    document.body.appendChild(this.panel);
  }

  createUI() {
    const panel = document.createElement('div');
    panel.className = 'control-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <h1>MILKY WAY</h1>
        <p>Interactive Galaxy Explorer</p>
      </div>
      <div class="panel-stats">
        <span id="fps-counter">60 FPS</span>
        <span id="star-counter">0 Stars</span>
      </div>
      <div class="panel-controls">
        <div class="control-group">
          <label>Galaxy Rotation</label>
          <input type="range" id="rotation-speed" min="0" max="100" value="50" />
        </div>
        <div class="control-group">
          <label>Galaxy Brightness</label>
          <input type="range" id="brightness" min="0" max="100" value="70" />
        </div>
        <div class="control-group">
          <label>Nebula Intensity</label>
          <input type="range" id="nebula-intensity" min="0" max="100" value="50" />
        </div>
        <div class="control-group">
          <label>Dust Density</label>
          <input type="range" id="dust-density" min="0" max="100" value="50" />
        </div>
        <div class="control-group">
          <label>Bloom</label>
          <input type="range" id="bloom" min="0" max="100" value="60" />
        </div>
        <div class="control-group">
          <label>Quality</label>
          <select id="quality">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high" selected>High</option>
            <option value="ultra">Ultra</option>
          </select>
        </div>
      </div>
      <div class="panel-presets">
        <button data-preset="overview">Galaxy Overview</button>
        <button data-preset="center">Galactic Center</button>
        <button data-preset="spiral">Spiral Arms</button>
        <button data-preset="outer">Outer Galaxy</button>
        <button data-preset="top">Top View</button>
        <button data-preset="side">Side View</button>
      </div>
      <div class="panel-actions">
        <button id="reset-camera">Reset Camera</button>
        <button id="pause-btn">Pause</button>
        <button id="info-btn">Info</button>
      </div>
      <div class="panel-shortcuts">
        <span>R: Reset | P: Pause | G: Overview | C: Center | I: Info | U: UI</span>
      </div>
      <div class="info-panel" id="info-panel" style="display:none;">
        <h2>MILKY WAY GALAXY</h2>
        <p><strong>Type:</strong> Barred Spiral Galaxy</p>
        <p><strong>Diameter:</strong> ~100,000 light-years</p>
        <p><strong>Central Object:</strong> Sagittarius A*</p>
        <p><strong>Location:</strong> Local Group</p>
        <p>This is an artistic/scientific approximation. Real astronomical data is far more complex.</p>
      </div>
    `;

    this.attachListeners(panel);
    return panel;
  }

  attachListeners(panel) {
    const bind = (id, event, handler) => {
      const el = panel.querySelector(id);
      if (el) el.addEventListener(event, handler);
    };

    bind('#rotation-speed', 'input', (e) => this.onChange('rotationSpeed', e.target.value / 1000));
    bind('#brightness', 'input', (e) => this.onChange('brightness', e.target.value / 100));
    bind('#nebula-intensity', 'input', (e) => this.onChange('nebulaIntensity', e.target.value / 100));
    bind('#dust-density', 'input', (e) => this.onChange('dustDensity', e.target.value / 100));
    bind('#bloom', 'input', (e) => this.onChange('bloom', e.target.value / 100));
    bind('#quality', 'change', (e) => this.onChange('quality', e.target.value));

    bind('[data-preset]', 'click', (e) => this.onChange('preset', e.target.dataset.preset));
    bind('#reset-camera', 'click', () => this.onChange('preset', 'overview'));
    bind('#pause-btn', 'click', () => this.onChange('pause'));
    bind('#info-btn', 'click', () => {
      const info = panel.querySelector('#info-panel');
      info.style.display = info.style.display === 'none' ? 'block' : 'none';
    });
  }

  updateStats(fps, starCount) {
    const fpsEl = document.getElementById('fps-counter');
    const starEl = document.getElementById('star-counter');
    if (fpsEl) fpsEl.textContent = `${Math.round(fps)} FPS`;
    if (starEl) starEl.textContent = `${starCount.toLocaleString()} Stars`;
  }

  toggle() {
    this.isVisible = !this.isVisible;
    this.panel.style.display = this.isVisible ? 'block' : 'none';
  }
}
