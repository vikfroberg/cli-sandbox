import { glob } from "glob";
import chokidar from "chokidar";
import chalk from "chalk";
import { CMD_TYPES } from "./commands.js";
import {
  updateDiscoverSandboxes,
  updateLoadSandbox,
  updateReturnToWelcome,
} from "./update.js";

// Runtime state to track side effects
let watcher = null;

export function createRuntime(dispatch) {
  return {
    executeCommand,
  };

  async function executeCommand(command) {
    switch (command.type) {
      case CMD_TYPES.RENDER:
        render(command.content);
        break;

      case CMD_TYPES.CLEAR_SCREEN:
        clearScreen();
        break;

      case CMD_TYPES.DISCOVER_SANDBOXES:
        await discoverSandboxes(command.pattern);
        break;

      case CMD_TYPES.LOAD_SANDBOX:
        await loadSandbox(command.filePath);
        break;

      case CMD_TYPES.SETUP_WATCHER:
        setupWatcher(command.pattern);
        break;

      case CMD_TYPES.CLOSE_WATCHER:
        closeWatcher();
        break;

      case CMD_TYPES.EXIT:
        exit();
        break;

      case CMD_TYPES.BATCH:
        for (const cmd of command.commands) {
          await executeCommand(cmd);
        }
        break;

      case CMD_TYPES.NONE:
        // Do nothing
        break;

      default:
        console.error("Unknown command type:", command.type);
    }
  }

  function render(content) {
    content.split("\n").forEach((line) => console.log(line));
  }

  async function discoverSandboxes(pattern) {
    try {
      const files = await glob(pattern, {
        cwd: process.cwd(),
        absolute: true,
      });

      if (files.length === 0) {
        console.log(
          chalk.yellow("No sandbox files found matching pattern:"),
          pattern,
        );
        console.log(
          chalk.gray(
            "Create files that match ${pattern} that export test cases",
          ),
        );
        return;
      }

      dispatch(updateDiscoverSandboxes, files);
    } catch (error) {
      console.error(chalk.red("Error discovering sandboxes:"), error.message);
    }
  }

  async function loadSandbox(filePath) {
    try {
      const module = await import(`file://${filePath}?t=${Date.now()}`);
      const examples = module.default || [];
      dispatch(updateLoadSandbox, filePath, examples);
    } catch (error) {
      console.error(chalk.red("Error loading sandbox:"), error.message);
      dispatch(updateLoadSandbox, filePath, []);
    }
  }

  function setupWatcher(pattern) {
    closeWatcher(); // Close existing watcher if any

    watcher = chokidar.watch(pattern, {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true, // Don't trigger events for files that already exist
    });

    watcher.on("change", async (filePath) => {
      // Note: We need current model state to check if this file is currently loaded
      // For now, we'll reload any changed file - this could be optimized
      try {
        const module = await import(`file://${filePath}?t=${Date.now()}`);
        const examples = module.default || [];
        dispatch(updateLoadSandbox, filePath, examples);
      } catch (error) {
        console.error(chalk.red("Error reloading sandbox:"), error.message);
      }
    });

    watcher.on("add", async () => {
      const files = await glob(pattern, {
        cwd: process.cwd(),
        absolute: true,
      });
      dispatch(updateDiscoverSandboxes, files);
    });
  }

  function closeWatcher() {
    if (watcher) {
      watcher.close();
      watcher = null;
    }
  }

  function exit() {
    closeWatcher();

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }

    process.exit(0);
  }
}

