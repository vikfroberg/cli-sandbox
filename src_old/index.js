#!/usr/bin/env node

import chalk from "chalk";
import { DEFAULT_PATTERN, HELP_TEXT } from "./constants.js";
import { init, updateKeyPress } from "./update.js";
import { createRuntime } from "./runtime.js";

function setupInterface(dispatch) {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  process.stdin.on("data", (key) => {
    dispatch(updateKeyPress, key);
  });

  process.on("SIGINT", () => {
    process.exit(0);
  });
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

  // TEA architecture setup
  let currentModel;

  function dispatch(updateFn, ...args) {
    const [newModel, command] = updateFn(currentModel, ...args);
    currentModel = newModel;
    runtime.executeCommand(command);
  }

  const runtime = createRuntime(dispatch);

  try {
    // Initialize the application
    const [initialModel, initialCommand] = init(pattern);
    currentModel = initialModel;

    await runtime.executeCommand(initialCommand);
    setupInterface(dispatch);
  } catch (error) {
    console.error(chalk.red("Error starting playground:"), error.message);
    process.exit(1);
  }
}

// Pure TEA application - no exports needed

main();
