import { makeAutoObservable } from 'mobx';

class Blend {
  constructor() {
    this.r = 1;
    this.g = 1;
    this.b = 1;

    makeAutoObservable(this);
  }

  fromString(str) {
    [this.r, this.g, this.b] = str.split(' ').map(parseFloat);
  }
}

export default Blend;
