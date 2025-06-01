#!/usr/bin/env node

import * as App from "./app.js";
import { showHelp } from "./help.js";
import { DEFAULT_PATTERN } from "./shared.js";
import { glob } from "glob";
import chokidar from "chokidar";

function clearScreen() {
  process.stdout.write("\x1b[2J\x1b[H");
}

// Dependency injection functions
async function findSandboxFiles(pattern) {
  return await glob(pattern, {
    cwd: process.cwd(),
    absolute: true,
  });
}

function createKeyPressSubscription(dispatch) {
  process.stdin.on("data", (key) => {
    dispatch({ type: "KeyPress", key });
  });

  return () => {
    process.stdin.removeAllListeners("data");
  };
}

function createFileWatchSubscription(pattern, handlers, dispatch) {
  const watcher = chokidar.watch(pattern, {
    ignored: /node_modules/,
    persistent: true,
    ignoreInitial: true,
  });

  if (handlers.change) {
    watcher.on("change", (file) => handlers.change(file));
  }
  if (handlers.add) {
    watcher.on("add", (files) => handlers.add(files));
  }

  return () => watcher.close();
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    showHelp();
    return;
  }

  const pattern = args[0] || DEFAULT_PATTERN;

  // TEA architecture setup
  let currentModel = await App.init(pattern, { findSandboxFiles });
  let activeSubscriptions = [];

  function dispatch(msg) {
    const newModel = App.update(msg, currentModel);
    currentModel = newModel;

    // Clean up old subscriptions
    activeSubscriptions.forEach((cleanup) => cleanup());
    activeSubscriptions = [];

    // Setup new subscriptions based on new model
    const newSubs = App.subscriptions(
      currentModel,
      {
        keyPress: createKeyPressSubscription,
        watchFiles: createFileWatchSubscription,
      },
      dispatch,
    );

    activeSubscriptions = newSubs;

    // Re-render
    clearScreen();
    App.render(currentModel, dispatch);
  }

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  // Initial render and subscriptions
  clearScreen();
  App.render(currentModel, dispatch);

  const initialSubs = App.subscriptions(
    currentModel,
    {
      keyPress: createKeyPressSubscription,
      watchFiles: createFileWatchSubscription,
    },
    dispatch,
  );

  activeSubscriptions = initialSubs;

  process.on("SIGINT", () => {
    activeSubscriptions.forEach((cleanup) => cleanup());
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.exit(0);
  });
}

main();
