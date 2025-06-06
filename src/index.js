#!/usr/bin/env node

import React, { createElement as h } from "react";
import { render } from "ink";
import help from "./help.js";
import App from "./app.js";
import { loadSandboxes, cleanupBundles } from "./utils.js";

const DEFAULT_PATTERN = "**/*_sandbox.{js,mjs,cjs,ts,tsx,jsx}";

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    return console.log(help(DEFAULT_PATTERN));
  }

  // Cleanup on exit
  process.on("exit", cleanupBundles);
  process.on("SIGINT", () => {
    cleanupBundles();
    process.exit();
  });

  const watch = args.includes("--watch") || args.includes("-w");
  const pattern = args.find((arg) => !arg.startsWith("--")) || DEFAULT_PATTERN;

  process.stdout.write("\x1b[?1049h"); // alternate screen

  const initialSandboxes = await loadSandboxes(pattern);
  render(h(App, { pattern, watch, initialSandboxes }));
}

main().catch(console.error);
