import child_process from 'child_process';
import fs from 'fs';
import path from 'path';

// Integration layer with Valve's Source 2 resource parser and decompiler
// See: https://github.com/SteamDatabase/ValveResourceFormat/
class ValveResourceFormat {
  constructor(dotaDirVPKPath, decompilerPath, extractPath) {
    this.dotaDirVPKPath = dotaDirVPKPath;
    this.decompilerPath = decompilerPath;
    this.extractPath = extractPath;
  }

  execute(...args) {
    // TODO: Async support
    const output = child_process.execFileSync(this.decompilerPath, args, {
      encoding: 'utf8',
    });
    return output;
  }

  extract(resource) {
    this.execute(
      '-i', this.dotaDirVPKPath,
      '-o', this.extractPath,
      '-d',
      '-f', resource,
    );
  }

  fetch(resource, { encoding = null } = {}) {
    const fqpath = path.join(this.extractPath, resource);
    // TODO: Async support
    if (!fs.existsSync(fqpath)) {
      return this.extract(resource);
    }
    return fs.readFileSync(fqpath, { encoding });
  }

  get version() {
    return this.execute('--version').trim();
  }
}

export default ValveResourceFormat;
