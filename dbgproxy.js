#!/usr/bin/env node

if (Number(process.version.match(/^v(\d+)\./)[1]) < 8) {
  console.error('ERROR: this application requires at least Node.js version 8, please install the LTS release from https://nodejs.org/en/download/.');
  process.exit(-1);
}

require('./dbgproxy-impl.js');
