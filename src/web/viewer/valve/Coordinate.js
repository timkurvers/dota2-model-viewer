import { makeAutoObservable } from 'mobx';

import { INCHES_TO_METERS } from '../utils.js';

// See: https://developer.valvesoftware.com/wiki/Coordinates
class Coordinate {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;

    makeAutoObservable(this);
  }

  get normalized() {
    return [
      this.y * INCHES_TO_METERS,
      this.z * INCHES_TO_METERS,
      this.x * INCHES_TO_METERS,
    ];
  }

  fromString(str) {
    [this.x, this.y, this.z] = str.split(' ').map(parseFloat);
  }
}

export default Coordinate;
