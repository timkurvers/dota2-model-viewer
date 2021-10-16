import { configure, makeAutoObservable } from 'mobx';

import { ValveCoordinate, ValveLight, ValveQAngle } from './valve/index.js';

// Disable enforcing actions as dat.gui (powering the debug panel) does not allow
// wrapping modifications in a MobX-friendly manner
configure({ enforceActions: 'never' });

class SceneState {
  constructor(query) {
    let animate = !query.has('portrait');
    if (query.has('animate')) {
      animate = query.get('animate') !== 'false';
    }

    this.model = {
      animation: null,
      animate,
      portrait: false,
    };

    this.camera = {
      position: new ValveCoordinate(),
      rotation: new ValveQAngle(),
      fov: 27,
      near: 0.1,
      far: 2000,
    };

    this.lights = {
      ambient: new ValveLight(),
      spotlight: new ValveLight(),
    };

    this.helpers = {
      axes: query.has('helpers'),
      grid: query.has('helpers'),
      spotlight: query.has('helpers'),
      camera: query.has('helpers'),
    };

    makeAutoObservable(this);
  }

  loadPortraitDefinition(definition) {
    // Consistency (╯°□°)╯︵ ┻━┻
    const camera = definition.cameras.default || definition.cameras.Default;
    this.camera.position.fromString(camera.PortraitPosition);
    this.camera.rotation.fromString(camera.PortraitAngles);
    if (camera.PortraitFOV) {
      this.camera.fov = parseFloat(camera.PortraitFOV);
    }
    if (camera.PortraitFar) {
      this.camera.far = parseFloat(camera.PortraitFar);
    }

    this.lights.ambient.color.fromString(definition.PortraitAmbientColor);
    this.lights.ambient.rotation.fromString(definition.PortraitAmbientDirection);
    this.lights.ambient.scale = parseFloat(definition.PortraitAmbientScale);

    this.lights.spotlight.position.fromString(definition.PortraitLightPosition);
    this.lights.spotlight.rotation.fromString(definition.PortraitLightAngles);
    if (definition.PortraitLightColor) {
      this.lights.spotlight.color.fromString(definition.PortraitLightColor);
    }
    this.lights.spotlight.scale = parseFloat(definition.PortraitLightScale);
    this.lights.spotlight.fov = parseFloat(definition.PortraitLightFOV);
  }
}

export default SceneState;
