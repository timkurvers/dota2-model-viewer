#!/usr/bin/env node

import app from '../src/index.js';
import config from '../src/config.js';

const port = config.PORT;

app.listen(port, () => {
  console.log(`Dota 2 Portraits listening at http://localhost:${port}`);
});
