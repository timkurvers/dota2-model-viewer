#!/usr/bin/env node
/* eslint-disable no-await-in-loop */
/* global document */

import fs from 'fs';
import path from 'path';

import puppeteer from 'puppeteer';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'; // eslint-disable-line

import config from '../src/pipeline/config.js';
import { stripIndent } from '../src/pipeline/utils.js';

// Waits for page to dispatch requested event within given timeout duration
// Adapted from: https://github.com/puppeteer/puppeteer/issues/2455
const untilEvent = async (page, event, timeout = 15000) => (
  new Promise((resolve) => {
    let handle = null;
    page.evaluate((e) => new Promise((r) => {
      document.addEventListener(e, r, { once: true });
    }), event).then(() => {
      clearTimeout(handle);
      resolve();
    });
    handle = setTimeout(resolve, timeout);
  })
);

// Generates a model viewer URL from provided options
const generateModelViewerURL = (options) => {
  const url = new URL(options.url);
  const params = url.searchParams;
  if (options.model) {
    params.set('model', options.model);
  }
  if (options.helpers) {
    params.set('helpers', '');
  }
  if (options.portrait) {
    params.set('portrait', '');
  }
  return url.toString();
};

// Executes given block within a puppeteer context
const withPuppeteer = async (block, { width, height, headless = true } = {}) => {
  const browser = await puppeteer.launch({
    defaultViewport: { width, height },
    headless,
  });
  const page = await browser.newPage();
  try {
    await block(page);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await browser.close();
  }
};

// Screenshots given URL after instructing page to navigate to it
const screenshot = async (page, options, io = process.stdout) => {
  const { model, output } = options;
  const url = generateModelViewerURL(options);
  io.write(`processing: ${model}`);

  await page.goto(url);
  io.write('; loaded');

  await untilEvent(page, 'model-viewer:ready');
  await page.screenshot({ path: output });
  io.write(`; screenshotted to ${output}\n`);
};

yargs(hideBin(process.argv))
  .scriptName('npm run screenshot')

  // Model viewer options
  .group(['helpers', 'portrait', 'url'], 'Model viewer options:')
  .option('helpers', {
    boolean: true,
    default: false,
    describe: 'Enables scene helpers.',
  })
  .option('portrait', {
    boolean: true,
    default: false,
    describe: 'Enforce portrait mode.',
  })
  .option('url', {
    default: `http://localhost:${config.PORT}`,
    describe: 'Base URL to the pipeline & model viewer.',
  })

  // Processing options
  .group(['width', 'height', 'headless'], 'Processing options:')
  .option('width', {
    alias: 'w',
    default: 1000,
    describe: 'Width of scene and screenshot in pixels.',
  })
  .option('height', {
    alias: 'h',
    default: 1000,
    describe: 'Height of scene and screenshot in pixels.',
  })
  .option('headless', {
    boolean: true,
    default: true,
    describe: 'Whether to launch a headless or full version of Chromium.',
  })

  // Single model screenshot command
  .command('model <file> <output>', 'Screenshots given single model.', () => {}, (yargv) => {
    const options = { ...yargv, model: yargv.file };
    return withPuppeteer(async (page) => {
      await screenshot(page, options);
    }, options);
  })
  .example('$0 model models/creeps/roshan/roshan.vmdl roshan.png')
  .example('$0 model model.vmdl model.png -- --portrait -w 235 -h 272')

  // Batch screenshots command
  .command('batch <file> [output]', 'Screenshots entries from given batch file.', () => {}, (yargv) => {
    const options = yargv;
    const { output = '.' } = options;
    const entries = fs.readFileSync(options.file, 'utf8').trim().split(/\r?\n/);
    return withPuppeteer(async (page) => {
      for (const entry of entries) {
        const [model, outfile] = entry.trim().split(/:\s+/);
        options.model = model;
        options.output = path.join(output, outfile);
        await screenshot(page, options);
      }
    }, options);
  })
  .example('$0 batch entries.txt -- --portrait --no-headless')
  .epilogue(stripIndent`
    Batch file text format:
      models/courier/navi_courier/navi_courier_flying.vmdl: navi-courier.png
      models/creeps/roshan/roshan.vmdl: roshan.png
  `)

  .demandCommand(1, '')
  .strict()
  .help(false)
  .version(false)
  .parse();
