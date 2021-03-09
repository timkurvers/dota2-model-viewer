#!/usr/bin/env node
/* eslint-disable no-await-in-loop */
/* global document */

import fs from 'fs';
import path from 'path';

import puppeteer from 'puppeteer';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'; // eslint-disable-line

import config from '../src/pipeline/config.js';
import { stripIndent } from '../src/pipeline/utils/index.js';

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
  const { output, params } = options;

  const url = new URL(`${options.url}?${params}`);
  io.write(`processing: ${params}`);

  await page.goto(url);
  io.write(' ...');

  await untilEvent(page, 'model-viewer:ready');
  await page.screenshot({ path: output, omitBackground: true });
  io.write(`\b\b\b=> ${output}\n`);
};

yargs(hideBin(process.argv))
  .scriptName('npm run screenshot')
  .option('url', {
    default: `http://localhost:${config.PORT}`,
    describe: 'Base URL to the pipeline & model viewer.',
  })
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

  .command('$0 <file> [output]', 'Screenshots entries from given batch file.', (yargv) => {
    yargv
      .positional('file', { describe: 'Batch file to load. See format below.' })
      .positional('output', { describe: 'Output directory.', default: '.' })
      .example('$0 batch entries.txt -- -w 235 -h 272 --no-headless')
      .epilogue(stripIndent`
        Batch file text format:
          model=models/creeps/roshan/roshan.vmdl: roshan.png
          model=models/creeps/roshan/roshan.vmdl&portrait: roshan-portrait.png
      `);
  }, (yargv) => {
    const options = yargv;
    const { output } = options;
    const entries = fs.readFileSync(options.file, 'utf8').trim().split(/\r?\n/);
    return withPuppeteer(async (page) => {
      for (const entry of entries) {
        const [params, outfile] = entry.trim().split(/:\s+/);
        options.params = params;
        options.output = path.join(output, outfile);
        await screenshot(page, options);
      }
    }, options);
  })
  .strict()
  .help(false)
  .version(false)
  .parse();
