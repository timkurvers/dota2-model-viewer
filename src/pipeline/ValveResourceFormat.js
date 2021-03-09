import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';

import { changeExtension } from './utils/index.js';

const CONVERSIONS = {
  '.vmdl': '.glb',
  '.vtex': '.png',
};
const ENCODINGS = {
  '.txt': 'utf8',
  '.vmat': 'utf8',
};

// Integration layer with Valve's Source 2 resource parser and decompiler
// See: https://github.com/SteamDatabase/ValveResourceFormat/
class ValveResourceFormat {
  constructor(dotaDirVPKPath, decompilerPath, extractPath) {
    this.dotaDirVPKPath = dotaDirVPKPath;
    this.decompilerPath = decompilerPath;
    this.extractPath = extractPath;
  }

  execute(args, { maxBuffer = undefined } = {}) {
    // TODO: Async support
    const output = childProcess.execFileSync(this.decompilerPath, args, {
      encoding: 'utf8',
      maxBuffer,
    });
    return output;
  }

  extract(resource) {
    this.execute([
      '-i', this.dotaDirVPKPath,
      '-o', this.extractPath,
      '--gltf_export_materials',
      '--gltf_export_format', 'glb',
      '-d',
      '-f', resource,
    ]);
  }

  fetch(resource) {
    const srcpath = path.join(this.extractPath, resource);
    const extension = path.extname(srcpath);
    const outpath = changeExtension(srcpath, CONVERSIONS[extension]);

    // TODO: Async support
    if (!fs.existsSync(outpath)) {
      this.extract(resource);
    }
    const encoding = ENCODINGS[extension];
    return fs.readFileSync(outpath, { encoding });
  }

  list({ extension = undefined } = {}) {
    const extFilter = extension ? `-e ${extension}` : '';
    const listing = this.execute(['-i', this.dotaDirVPKPath, '-l', extFilter], {
      maxBuffer: Number.MAX_SAFE_INTEGER,
    });
    return listing.match(/(?<=^\s+).+/gm);
  }

  get version() {
    return this.execute(['--version']).trim();
  }
}

export default ValveResourceFormat;
