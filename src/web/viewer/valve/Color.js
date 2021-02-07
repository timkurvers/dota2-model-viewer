import { makeAutoObservable } from 'mobx';

// See: https://developer.valvesoftware.com/wiki/$color
class Color {
  constructor() {
    this.value = 0xFFFFFF;

    makeAutoObservable(this);
  }

  fromString(str) {
    const [r, g, b] = str.split(' ').map(parseFloat);
    this.value = (r << 16) | (g << 8) | b;
  }
}

export default Color;
