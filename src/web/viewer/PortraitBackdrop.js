import * as THREE from 'three';

import ValveBlend from './valve/Blend.js';

const { lerp } = THREE.MathUtils;

// See: https://en.wikipedia.org/wiki/Bilinear_interpolation
const blerp = (q12, q22, q11, q21, tx, ty) => {
  const r2 = lerp(q12, q22, tx);
  const r1 = lerp(q11, q21, tx);
  return lerp(r2, r1, ty);
};

class PortraitBackdrop extends THREE.CanvasTexture {
  constructor(canvas = document.createElement('canvas')) {
    super(canvas);

    this.background = null;
    this.blend = {
      tl: new ValveBlend(),
      tr: new ValveBlend(),
      bl: new ValveBlend(),
      br: new ValveBlend(),
    };
  }

  paint() {
    const { width, height } = this.background;
    const {
      tl, tr, bl, br,
    } = this.blend;

    const canvas = this.image;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.background, 0, 0);

    const imgdata = ctx.getImageData(0, 0, width, height);
    const { data } = imgdata;
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const i = (y * width + x) * 4;

        const tx = x / width;
        const ty = y / height;

        data[i + 0] *= blerp(tl.r, tr.r, bl.r, br.r, tx, ty);
        data[i + 1] *= blerp(tl.g, tr.g, bl.g, br.g, tx, ty);
        data[i + 2] *= blerp(tl.b, tr.b, bl.b, br.b, tx, ty);
      }
    }
    ctx.putImageData(imgdata, 0, 0);
  }

  paintDefault() {
    const canvas = this.image;
    const { width, height } = canvas;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
  }

  async loadPortraitDefinition(definition) {
    if (!definition.PortraitBackgroundTexture) {
      this.paintDefault();
      return;
    }

    this.background = await new THREE.ImageLoader().loadAsync(
      `${definition.PortraitBackgroundTexture}.png`,
    );
    if (definition.PortraitBackgroundColor1) {
      this.blend.bl.fromString(definition.PortraitBackgroundColor1);
    }
    if (definition.PortraitBackgroundColor2) {
      this.blend.tl.fromString(definition.PortraitBackgroundColor2);
    }
    if (definition.PortraitBackgroundColor3) {
      this.blend.tr.fromString(definition.PortraitBackgroundColor3);
    }
    if (definition.PortraitBackgroundColor4) {
      this.blend.br.fromString(definition.PortraitBackgroundColor4);
    }

    this.paint();
  }
}

export default PortraitBackdrop;
