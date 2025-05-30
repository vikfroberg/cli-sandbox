#!/usr/bin/env node

import { spawn } from 'child_process';
import chalk from 'chalk';

console.log(chalk.bold.blue('🎮 CLI Playground Demo'));
console.log(chalk.gray('This will demonstrate the enhanced interface features...\n'));

const child = spawn('node', ['src/index.js'], {
  stdio: ['pipe', 'inherit', 'inherit']
});

const commands = [
  { cmd: '/help', delay: 1500, desc: 'Show help' },
  { cmd: '/sandboxes', delay: 2000, desc: 'List sandboxes' },
  { cmd: '/switch errors', delay: 2000, desc: 'Switch to errors' },
  { cmd: '/focus multi', delay: 2000, desc: 'Focus on multi-line' },
  { cmd: '/clear', delay: 2000, desc: 'Clear screen' },
  { cmd: '/switch network', delay: 2000, desc: 'Switch to network errors' },
  { cmd: '/exit', delay: 2000, desc: 'Exit' }
];

let index = 0;
function sendNextCommand() {
  if (index >= commands.length) return;
  
  const { cmd, delay, desc } = commands[index];
  console.log(chalk.cyan(`\n→ Sending: ${cmd} (${desc})`));
  
  setTimeout(() => {
    child.stdin.write(cmd + '\n');
    index++;
    setTimeout(sendNextCommand, delay);
  }, 1000);
}

// Start the demo
setTimeout(sendNextCommand, 2000);

child.on('close', (code) => {
  console.log(chalk.green('\n✅ Demo completed!'));
  console.log(chalk.gray('The CLI Playground now has:'));
  console.log(chalk.white('• Enhanced prompt like Claude Code'));
  console.log(chalk.white('• Contextual hints and suggestions'));
  console.log(chalk.white('• Command syntax highlighting'));
  console.log(chalk.white('• Smooth input handling'));
  console.log(chalk.white('• Fallback support for non-TTY environments'));
});