#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing CLI Playground...\n');

const child = spawn('node', ['src/index.js'], {
  stdio: ['pipe', 'inherit', 'inherit']
});

setTimeout(() => {
  console.log('\nSending /help command...');
  child.stdin.write('/help\n');
}, 1000);

setTimeout(() => {
  console.log('\nSending /sandboxes command...');
  child.stdin.write('/sandboxes\n');
}, 2000);

setTimeout(() => {
  console.log('\nSending /switch errors command...');
  child.stdin.write('/switch errors\n');
}, 3000);

setTimeout(() => {
  console.log('\nSending /focus timeout command...');
  child.stdin.write('/focus timeout\n');
}, 4000);

setTimeout(() => {
  console.log('\nSending /exit command...');
  child.stdin.write('/exit\n');
}, 5000);

child.on('close', (code) => {
  console.log(`\nCLI Playground test completed with code ${code}`);
});