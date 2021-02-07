import { makeAutoObservable } from 'mobx';

import Color from './Color.js';
import Coordinate from './Coordinate.js';
import QAngle from './QAngle.js';

// See: https://developer.valvesoftware.com/wiki/Lighting
class Light {
  constructor() {
    this.color = new Color();
    this.position = new Coordinate();
    this.rotation = new QAngle();
    this.scale = 1.0;
    this.fov = 27;
    this.visible = true;

    makeAutoObservable(this);
  }
}

export default Light;
