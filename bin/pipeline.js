#!/usr/bin/env node

import app, { vrf } from '../src/pipeline/index.js';
import config from '../src/pipeline/config.js';

const port = config.PORT;

app.listen(port, () => {
  console.log('VRF decompiler version:', vrf.version);
  console.log('Path to extracted files:', vrf.extractPath);
  console.log('Path to pak01_dir.vpk:', vrf.dotaDirVPKPath);
  console.log();

  console.log(`Dota 2 Model Viewer listening at http://localhost:${port}`);
});
