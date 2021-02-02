#!/usr/bin/env node

import app from '../src/pipeline/index.js';
import config from '../src/pipeline/config.js';

const port = config.PORT;

app.listen(port, () => {
  console.log(`Dota 2 Model Viewer listening at http://localhost:${port}`);
});
