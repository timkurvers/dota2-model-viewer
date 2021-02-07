import { makeAutoObservable } from 'mobx';

import { DEGREES_TO_RADIANS } from '../utils.js';

// See: https://developer.valvesoftware.com/wiki/QAngle
class QAngle {
  constructor() {
    this.rX = 0;
    this.rY = 0;
    this.rZ = 0;

    makeAutoObservable(this);
  }

  get normalized() {
    return [
      -this.rX * DEGREES_TO_RADIANS,
      (this.rY - 90) * DEGREES_TO_RADIANS,
      -this.rZ * DEGREES_TO_RADIANS,
    ];
  }

  fromString(str) {
    [this.rX, this.rY, this.rZ] = str.split(' ').map(parseFloat);
  }
}

export default QAngle;
