import dat from 'dat.gui';

class DebugPanel {
  constructor(state, animations) {
    this.gui = new dat.GUI({ width: 300 });

    this.modelFolder = this.gui.addFolder('Model');
    if (animations.length) {
      this.modelFolder.add(state.model, 'animation', animations.map((a) => a.name));
      this.modelFolder.add(state.model, 'animate');
    }
    this.modelFolder.add(state.model, 'portrait').name('use portrait camera');
    this.modelFolder.open();

    this.helpersFolder = this.gui.addFolder('Helpers');
    this.helpersFolder.add(state.helpers, 'axes');
    this.helpersFolder.add(state.helpers, 'grid');
    this.helpersFolder.add(state.helpers, 'spotlight');
    this.helpersFolder.add(state.helpers, 'camera').name('portrait camera');
    this.helpersFolder.open();

    this.ambientFolder = this.gui.addFolder('Ambient Light');
    this.ambientFolder.add(state.lights.ambient, 'visible');
    this.ambientFolder.addColor(state.lights.ambient.color, 'value');
    this.ambientFolder.add(state.lights.ambient, 'scale', 0, 10, 0.1).name('scale (unused)');

    this.spotlightFolder = this.gui.addFolder('Spotlight');
    this.spotlightFolder.add(state.lights.spotlight, 'visible');
    this.spotlightFolder.addColor(state.lights.spotlight.color, 'value');
    this.spotlightFolder.add(state.lights.spotlight.position, 'x', -500, 500, 1);
    this.spotlightFolder.add(state.lights.spotlight.position, 'y', -500, 500, 1);
    this.spotlightFolder.add(state.lights.spotlight.position, 'z', -500, 500, 1);
    this.spotlightFolder.add(state.lights.spotlight.rotation, 'rX', 0, 360, 1);
    this.spotlightFolder.add(state.lights.spotlight.rotation, 'rY', 0, 360, 1);
    this.spotlightFolder.add(state.lights.spotlight.rotation, 'rZ', 0, 360, 1);
    this.spotlightFolder.add(state.lights.spotlight, 'scale', 0, 10, 0.1).name('scale (unused)');
    this.spotlightFolder.add(state.lights.spotlight, 'fov', 0, 200, 1);

    this.cameraFolder = this.gui.addFolder('Portrait Camera');
    this.cameraFolder.add(state.camera.position, 'x', -500, 500, 1);
    this.cameraFolder.add(state.camera.position, 'y', -500, 500, 1);
    this.cameraFolder.add(state.camera.position, 'z', -500, 500, 1);
    this.cameraFolder.add(state.camera.rotation, 'rX', 0, 360, 1);
    this.cameraFolder.add(state.camera.rotation, 'rY', 0, 360, 1);
    this.cameraFolder.add(state.camera.rotation, 'rZ', 0, 360, 1);
    this.cameraFolder.add(state.camera, 'fov', 0, 200, 1);
    this.cameraFolder.add(state.camera, 'far', 0, 3000, 1);
    this.cameraFolder.add(state.camera, 'near', 0, 80, 0.1);
  }
}

export default DebugPanel;
