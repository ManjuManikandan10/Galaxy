import * as THREE from 'three';
import { StarField } from './StarField.js';
import { GalacticCore } from './GalacticCore.js';
import { SpiralArms } from './SpiralArms.js';
import { Nebula } from './Nebula.js';
import { DustCloud } from './DustCloud.js';
import { GalacticHalo } from './GalacticHalo.js';

export class Galaxy {
  constructor(config) {
    this.config = config;
    this.group = new THREE.Group();
    this.components = {};
  }

  build() {
    this.components.core = new GalacticCore(this.config);
    this.group.add(this.components.core.group);

    this.components.bar = this.components.core.createBar();

    this.components.spiralArms = new SpiralArms(this.config);
    this.group.add(this.components.spiralArms.group);

    this.components.nebula = new Nebula(this.config);
    this.group.add(this.components.nebula.group);
    this.nebulaSprites = this.components.nebula.sprites;
    this.components.nebula.createNebulae();

    this.components.dust = new DustCloud(this.config);
    this.group.add(this.components.dust.group);
    this.dustPoints = this.components.dust.createDust();

    this.components.halo = new GalacticHalo(this.config);
    this.group.add(this.components.halo.group);
    this.components.halo.createHalo();

    this.components.core.createCore();
    this.components.core.createBlackHole();

    const bgStarCount = 60000;
    this.components.bgStars = new StarField(this.config);
    const bgPoints = this.components.bgStars.createBackgroundStars(bgStarCount, 1200);

    const mainStarField = new StarField(this.config);
    const mainPoints = mainStarField.createGalaxyStars(this.config);
    this.group.add(mainPoints);
    this.components.mainStars = mainPoints;

    this.bgPoints = bgPoints;

    return this.group;
  }

  getGroup() {
    return this.group;
  }
}
