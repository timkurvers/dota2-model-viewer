import express from 'express';
import morgan from 'morgan';

import ValveResourceFormat from './ValveResourceFormat.js';
import config from './config.js';

const app = express();

// Integration layer with Valve Resource Format to extract Dota 2 game files
const vrf = new ValveResourceFormat(
  config.DOTA2_DIR_VPK_PATH,
  config.VRF_DECOMPILER_PATH,
  config.VRF_EXTRACT_PATH,
);
console.log('VRF decompiler version:', vrf.version);
console.log('Path to extracted files:', vrf.extractPath);
console.log('Path to pak01_dir.vpk:', vrf.dotaDirVPKPath);
console.log();

app.use(morgan('dev'));
app.use(express.static('public'));

app.get('/portraits/:model([a-zA-Z/_-]+.vmdl).json', (req, res) => {
  res.send('TODO');
});

export default app;
export { vrf };
