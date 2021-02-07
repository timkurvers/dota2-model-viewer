import express from 'express';
import morgan from 'morgan';

import ValveResourceFormat from './ValveResourceFormat.js';
import config from './config.js';
import parseKeyValues from './parseKeyValues.js';
import webpackDevMiddleware from './middleware/webpack.js';

const app = express();

// Integration layer with Valve Resource Format to extract Dota 2 game files
const vrf = new ValveResourceFormat(
  config.DOTA2_DIR_VPK_PATH,
  config.VRF_DECOMPILER_PATH,
  config.VRF_EXTRACT_PATH,
);

// Extract and normalize the Dota 2 portrait definitions
const portraits = parseKeyValues(vrf.fetch('scripts/npc/portraits.txt')).Portraits;

// Preload list of all available models
const models = vrf.list({ extension: 'vmdl_c' }).map((model) => (
  model.replace('.vmdl_c', '.vmdl')
));

app.use(morgan('dev'));

if (process.env.NODE_ENV !== 'production') {
  app.use(webpackDevMiddleware());
}
app.use(express.static('public'));

// Lists all models
app.get('/models.json', (_, res) => {
  res.send(models);
});

// Lists all known portrait definitions
app.get('/portraits.json', (_, res) => {
  res.send(portraits);
});

// Fetches the portrait definition (if any) for given VMDL model
app.get('/portraits/:model([a-zA-Z0-9/_-]+.vmdl).json', (req, res) => {
  const { model } = req.params;
  if (model in portraits) {
    res.send(portraits[model]);
  } else {
    res.status(404).send({ error: 'Not Found' });
  }
});

// Fetches given VMDL model as a glTF binary resource
app.get('/:model([a-zA-Z0-9/_-]+.vmdl).glb', (req, res) => {
  const { model } = req.params;
  if (models.includes(model)) {
    res.contentType('model/gltf-binary');
    res.send(vrf.fetch(model));
  } else {
    res.status(404).send({ error: 'Not Found' });
  }
});

// Fetches primary texture for given material
app.get('/:material([a-zA-Z0-9/_-]+.vmat).png', (req, res) => {
  const { material } = req.params;
  const kv = parseKeyValues(vrf.fetch(material));
  // TODO: Is it always called Layer0?
  const texture = vrf.fetch(kv.Layer0.g_tColor);
  res.contentType('image/png');
  res.send(texture);
});

app.get('*', (_, res) => {
  res.status(404).send({ error: 'Not Found' });
});

export default app;
export { portraits, vrf };
