#!/usr/bin/env node

import { readdir, stat } from 'fs/promises';
import { join, resolve } from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import chokidar from 'chokidar';
import Fuse from 'fuse.js';
import * as readline from 'readline';
import { clearScreen, moveCursor, hideCursor, showCursor, clearLine } from './utils.js';

class CLIPlayground {
  constructor(pattern = '*_sandbox.mjs') {
    this.pattern = pattern;
    this.sandboxFiles = [];
    this.currentSandbox = null;
    this.examples = [];
    this.focusedExample = null;
    this.rl = null;
    this.watcher = null;
    this.isRunning = false;
    this.currentBoxWidth = 0;
    this.hasOpenBox = false;
    this.isWelcomeScreen = true;
    this.selectedSandboxIndex = 0;
    this.selectedExampleIndex = 0;
    this.isFocusedMode = false;
  }

  async start() {
    this.isRunning = true;
    
    await this.discoverSandboxes();
    
    if (this.sandboxFiles.length === 0) {
      console.log(chalk.yellow('No sandbox files found matching pattern:'), this.pattern);
      console.log(chalk.gray('Create files ending with _sandbox.mjs that export arrays of test cases'));
      return;
    }

    this.setupInterface();
    this.renderWelcomeScreen();
  }

  async discoverSandboxes() {
    const files = await glob(this.pattern, { 
      cwd: process.cwd(),
      absolute: true 
    });
    this.sandboxFiles = files;
  }

  async loadSandbox(filePath) {
    try {
      const module = await import(`file://${filePath}?t=${Date.now()}`);
      const examples = module.default || [];
      
      this.currentSandbox = filePath;
      this.examples = examples.map((example, index) => ({
        id: `${filePath}-${index}`,
        index,
        example,
        filePath
      }));
    } catch (error) {
      console.error(chalk.red('Error loading sandbox:'), error.message);
      this.examples = [];
    }
  }

  setupWatcher() {
    if (this.watcher) {
      this.watcher.close();
    }
    
    this.watcher = chokidar.watch(this.pattern, {
      ignored: /node_modules/,
      persistent: true
    });

    this.watcher.on('change', async (filePath) => {
      if (filePath === this.currentSandbox) {
        await this.loadSandbox(filePath);
        this.render();
      }
    });

    this.watcher.on('add', async () => {
      await this.discoverSandboxes();
    });
  }

  setupInterface() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    hideCursor();

    process.stdin.on('data', (key) => {
      this.handleKeyPress(key);
    });

    process.on('SIGINT', () => {
      this.cleanup();
    });
  }


  handleKeyPress(key) {
    if (this.isWelcomeScreen) {
      this.handleWelcomeKeyPress(key);
    } else {
      this.handleSandboxKeyPress(key);
    }
  }

  handleWelcomeKeyPress(key) {
    switch (key) {
      case '\u0003': // Ctrl+C
      case 'q':
        this.cleanup();
        break;
      case '\u001b[A': // Up arrow
      case '\u000b': // Ctrl+K
        this.selectedSandboxIndex = Math.max(0, this.selectedSandboxIndex - 1);
        this.renderWelcomeScreen();
        break;
      case '\u001b[B': // Down arrow
      case '\u000a': // Ctrl+J
        this.selectedSandboxIndex = Math.min(this.sandboxFiles.length - 1, this.selectedSandboxIndex + 1);
        this.renderWelcomeScreen();
        break;
      case '\r': // Enter
        this.selectSandbox();
        break;
    }
  }

  handleSandboxKeyPress(key) {
    switch (key) {
      case '\u0003': // Ctrl+C
      case 'q':
        this.cleanup();
        break;
      case '\u001b[A': // Up arrow
      case '\u000b': // Ctrl+K
        if (!this.isFocusedMode) {
          this.selectedExampleIndex = Math.max(0, this.selectedExampleIndex - 1);
          this.render();
        }
        break;
      case '\u001b[B': // Down arrow
      case '\u000a': // Ctrl+J
        if (!this.isFocusedMode) {
          this.selectedExampleIndex = Math.min(this.examples.length - 1, this.selectedExampleIndex + 1);
          this.render();
        }
        break;
      case '\r': // Enter
        this.toggleFocus();
        break;
      case '\u001b': // Escape
        if (this.isFocusedMode) {
          this.isFocusedMode = false;
          this.render();
        } else {
          this.returnToWelcome();
        }
        break;
      case 'h':
        this.showHelp();
        break;
    }
  }

  async selectSandbox() {
    const selectedFile = this.sandboxFiles[this.selectedSandboxIndex];
    this.isWelcomeScreen = false;
    this.selectedExampleIndex = 0;
    this.isFocusedMode = false;
    await this.loadSandbox(selectedFile);
    this.setupWatcher();
    this.render();
  }

  toggleFocus() {
    this.isFocusedMode = !this.isFocusedMode;
    this.render();
  }

  returnToWelcome() {
    this.isWelcomeScreen = true;
    this.isFocusedMode = false;
    if (this.watcher) {
      this.watcher.close();
    }
    this.renderWelcomeScreen();
  }

  showHelp() {
    console.log('\n' + chalk.bold('Available Commands:'));
    console.log(chalk.cyan('/help') + '          - Show this help');
    console.log(chalk.cyan('/focus [query]') + ' - Focus on specific examples (fuzzy search)');
    console.log(chalk.cyan('/sandboxes') + '     - List all sandbox files');
    console.log(chalk.cyan('/switch <file>') + ' - Switch to a different sandbox');
    console.log(chalk.cyan('/clear') + '         - Clear screen and re-render');
    console.log(chalk.cyan('/exit') + '          - Exit playground\n');
  }

  showFocusSearch(query) {
    if (!query) {
      this.focusedExample = null;
      this.render();
      return;
    }

    const fuse = new Fuse(this.examples, {
      keys: ['example.name', 'example.description'],
      threshold: 0.3
    });

    const results = fuse.search(query);
    
    if (results.length > 0) {
      this.focusedExample = results[0].item;
      console.log(chalk.green('Focused on:'), this.focusedExample.example.name || `Example ${this.focusedExample.index}`);
    } else {
      console.log(chalk.yellow('No matching examples found for:'), query);
    }
    
    this.render();
  }

  showSandboxes() {
    console.log('\n' + chalk.bold('Available Sandboxes:'));
    this.sandboxFiles.forEach((file, index) => {
      const marker = file === this.currentSandbox ? chalk.green('●') : chalk.gray('○');
      console.log(`${marker} ${chalk.cyan(file.split('/').pop())}`);
    });
    console.log();
  }

  async switchSandbox(fileName) {
    const targetFile = this.sandboxFiles.find(f => 
      f.includes(fileName) || f.endsWith(fileName)
    );
    
    if (targetFile) {
      await this.loadSandbox(targetFile);
      this.focusedExample = null;
      this.render();
      console.log(chalk.green('Switched to:'), targetFile.split('/').pop());
    } else {
      console.log(chalk.red('Sandbox not found:'), fileName);
      this.showSandboxes();
    }
  }

  renderWelcomeScreen() {
    clearScreen();
    
    console.log(chalk.bold.blue('🎮 CLI Playground'));
    console.log(chalk.gray('Select a sandbox to explore:\n'));
    
    this.sandboxFiles.forEach((file, index) => {
      const fileName = file.split('/').pop().replace('_sandbox.mjs', '');
      const isSelected = index === this.selectedSandboxIndex;
      
      const marker = isSelected ? chalk.blue('▶ ') : '  ';
      const name = isSelected ? 
        chalk.bold.blue(fileName) : 
        chalk.white(fileName);
      
      console.log(`${marker}${name}`);
    });
    
    console.log();
    console.log(chalk.gray('Navigate: ↑/↓ or Ctrl+K/J  •  Select: Enter  •  Quit: q'));
  }

  render() {
    clearScreen();
    
    const width = process.stdout.columns || 80;
    const header = chalk.bold.blue('🎮 CLI Playground') + 
                  (this.currentSandbox ? chalk.gray(` - ${this.currentSandbox.split('/').pop()}`) : '') +
                  (this.isFocusedMode ? chalk.yellow(' [FOCUSED]') : '');
    
    console.log(header);
    console.log();
    
    // Determine which examples to show
    let examplesToRender;
    let startIndex = 0;
    
    if (this.isFocusedMode) {
      // Show only the selected example
      examplesToRender = [this.examples[this.selectedExampleIndex]];
      startIndex = this.selectedExampleIndex;
    } else {
      // Show all examples
      examplesToRender = this.examples;
    }
    
    if (examplesToRender.length === 0) {
      console.log(chalk.yellow('No examples to display'));
    } else {
      examplesToRender.forEach((item, arrayIndex) => {
        const exampleIndex = this.isFocusedMode ? startIndex : arrayIndex;
        const { example } = item;
        const isSelected = exampleIndex === this.selectedExampleIndex;
        
        // Add selection indicator (only show in non-focused mode)
        const marker = (!this.isFocusedMode && isSelected) ? chalk.blue('▶ ') : '  ';
        const exampleNumber = `[${exampleIndex + 1}]`;
        const numberColor = isSelected ? chalk.bold.blue : chalk.gray;
        
        if (example.name) {
          const nameColor = isSelected ? chalk.bold.yellow : chalk.yellow;
          console.log(`${marker}${numberColor(exampleNumber)} ${nameColor(example.name)}`);
        } else {
          const defaultName = `Example ${exampleIndex + 1}`;
          const nameColor = isSelected ? chalk.bold.yellow : chalk.yellow;
          console.log(`${marker}${numberColor(exampleNumber)} ${nameColor(defaultName)}`);
        }
        
        if (example.description) {
          const descColor = isSelected ? chalk.white : chalk.gray;
          console.log(`    ${descColor(example.description)}`);
        }
        
        console.log();
        
        if (typeof example.render === 'function') {
          try {
            example.render();
          } catch (error) {
            console.error(chalk.red('Error rendering example:'), error.message);
          }
        } else if (example.message) {
          console.error(example.message);
        }
        
        if (arrayIndex < examplesToRender.length - 1) {
          console.log();
          console.log(chalk.gray('─'.repeat(40)));
          console.log();
        }
      });
    }
    
    console.log();
    
    // Show different help text based on mode
    if (this.isFocusedMode) {
      console.log(chalk.gray('Enter/Esc to exit focus  •  Quit: q  •  Help: h'));
    } else {
      console.log(chalk.gray('Navigate: ↑/↓ or Ctrl+K/J  •  Focus: Enter  •  Back: Esc  •  Quit: q  •  Help: h'));
    }
  }


  cleanup() {
    this.isRunning = false;
    
    if (this.watcher) {
      this.watcher.close();
    }
    
    showCursor();
    process.stdin.setRawMode(false);
    
    console.log(chalk.gray('\nGoodbye! 👋'));
    process.exit(0);
  }
}

function printHelp() {
  console.log(chalk.bold('CLI Playground'));
  console.log('\nUsage:');
  console.log('  playground [pattern]');
  console.log('\nOptions:');
  console.log('  pattern    Glob pattern for sandbox files (default: *_sandbox.mjs)');
  console.log('\nExamples:');
  console.log('  playground                    # Find all *_sandbox.mjs files');
  console.log('  playground "**/*_test.mjs"   # Custom pattern');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }
  
  const pattern = args[0] || '*_sandbox.mjs';
  const playground = new CLIPlayground(pattern);
  
  try {
    await playground.start();
  } catch (error) {
    console.error(chalk.red('Error starting playground:'), error.message);
    process.exit(1);
  }
}

main();