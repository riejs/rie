#!/usr/bin/env node

import * as program from 'commander';
import { build } from './build';

program
  .command('build')
  .description('rie build for pages')
  .option('-c, --config <config file>', 'path of rie config file')
  .option('-m, --mode <production|test|dev>', 'build mode, default: production')
  .action(build)
  .on('--help', () => {
    console.log('\nExamples:');
    console.log('  rie build -c ./config.js\n');
  });

program.parse(process.argv);
