#!/usr/bin/env node

import { glob } from "glob";
import chalk from "chalk";
import chokidar from "chokidar";
import { CommandHandler } from "./command-handler.js";
import { Renderer } from "./renderer.js";
import { KeyboardHandler } from "./keyboard-handler.js";
import { DEFAULT_PATTERN, HELP_TEXT } from "./constants.js";

class CLIPlayground {
  constructor(pattern = DEFAULT_PATTERN) {
    this.pattern = pattern;
    this.sandboxFiles = [];
    this.currentSandbox = null;
    this.examples = [];
    this.focusedExample = null;
    this.watcher = null;
    this.isWelcomeScreen = true;
    this.selectedSandboxIndex = 0;
    this.selectedExampleIndex = 0;
    this.isFocusedMode = false;

    // Initialize handlers
    this.commandHandler = new CommandHandler(this);
    this.renderer = new Renderer(this);
    this.keyboardHandler = new KeyboardHandler(this);
  }

  async start() {
    await this.discoverSandboxes();

    if (this.sandboxFiles.length === 0) {
      console.log(
        chalk.yellow("No sandbox files found matching pattern:"),
        this.pattern,
      );
      console.log(
        chalk.gray("Create files that match ${pattern} that export test cases"),
      );
      return;
    }

    this.setupInterface();
    this.renderer.renderWelcomeScreen();
  }

  async discoverSandboxes() {
    const files = await glob(this.pattern, {
      cwd: process.cwd(),
      absolute: true,
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
        filePath,
      }));
    } catch (error) {
      console.error(chalk.red("Error loading sandbox:"), error.message);
      this.examples = [];
    }
  }

  setupWatcher() {
    if (this.watcher) {
      this.watcher.close();
    }

    this.watcher = chokidar.watch(this.pattern, {
      ignored: /node_modules/,
      persistent: true,
    });

    this.watcher.on("change", async (filePath) => {
      if (filePath === this.currentSandbox) {
        await this.loadSandbox(filePath);
        this.renderer.render();
      }
    });

    this.watcher.on("add", async () => {
      await this.discoverSandboxes();
    });
  }

  setupInterface() {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (key) => {
      this.keyboardHandler.handleKeyPress(key);
    });

    process.on("SIGINT", () => {
      this.cleanup();
    });
  }

  async selectSandbox() {
    const selectedFile = this.sandboxFiles[this.selectedSandboxIndex];
    this.isWelcomeScreen = false;
    this.selectedExampleIndex = 0;
    this.isFocusedMode = false;
    await this.loadSandbox(selectedFile);
    this.setupWatcher();
    this.renderer.render();
  }

  toggleFocus() {
    this.isFocusedMode = !this.isFocusedMode;
    this.renderer.render();
  }

  returnToWelcome() {
    this.isWelcomeScreen = true;
    this.isFocusedMode = false;
    if (this.watcher) {
      this.watcher.close();
    }
    this.renderer.renderWelcomeScreen();
  }

  cleanup() {
    if (this.watcher) {
      this.watcher.close();
    }

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }

    console.log(chalk.gray("\nGoodbye! 👋"));
    process.exit(0);
  }
}

function printHelp() {
  console.log(HELP_TEXT.FULL);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  const pattern = args[0] || DEFAULT_PATTERN;
  const playground = new CLIPlayground(pattern);

  try {
    await playground.start();
  } catch (error) {
    console.error(chalk.red("Error starting playground:"), error.message);
    process.exit(1);
  }
}

main();
