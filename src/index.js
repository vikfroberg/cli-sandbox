import React, { createElement as h, useState } from "react";
import { render, Text, Box, useInput, useApp } from "ink";
import clear from "clear";
import { glob } from "glob";
import path from "path";
import chokidar from "chokidar";
import { HELP_TEXT } from "./help.js";
import { DEFAULT_PATTERN } from "./shared.js";

async function loadSandboxes(pattern) {
  const files = await glob(pattern, { cwd: process.cwd() });
  const sandboxes = [];

  for (const file of files) {
    try {
      const fullPath = path.resolve(file);
      const relativePath = path.relative(process.cwd(), fullPath);
      sandboxes.push(relativePath);
    } catch (error) {
      console.error(`Failed to load ${file}:`, error.message);
    }
  }

  return sandboxes;
}

function SandboxList({ sandboxes, selectedId }) {
  return h(
    Box,
    { gap: 1, flexDirection: "column" },
    h(
      Box,
      { flexDirection: "column" },
      h(Text, { bold: true }, "Playground"),
      h(Text, { color: "gray" }, "Use j/k to navigate, q to quit"),
    ),
    h(
      Box,
      { flexDirection: "column" },
      sandboxes.map((sandboxPath, index) => {
        const isSelected = sandboxPath === selectedId;
        return h(
          Box,
          { key: sandboxPath, flexDirection: "row", gap: 1 },
          h(Text, {}, isSelected ? "◉" : "○"),
          h(
            Box,
            { flexDirection: "column" },
            h(Text, { bold: isSelected }, sandboxPath),
          ),
        );
      }),
    ),
  );
}

function App({ initialSandboxes, pattern, watch }) {
  const { exit } = useApp();
  const [sandboxes, setSandboxes] = useState(initialSandboxes);
  const [maybeSelectedId, setSelectedId] = useState(null);
  const selectedId = maybeSelectedId || sandboxes[0];

  React.useEffect(() => {
    if (!watch) return;

    const watcher = chokidar.watch(pattern, {
      ignoreInitial: true,
      cwd: process.cwd(),
    });

    const reloadSandboxes = async () => {
      const loadedSandboxes = await loadSandboxes(pattern);
      setSandboxes(loadedSandboxes);
      if (loadedSandboxes.length > 0 && !selectedId) {
        setSelectedId(loadedSandboxes[0]);
      }
    };

    watcher.on("change", reloadSandboxes);
    watcher.on("add", reloadSandboxes);
    watcher.on("unlink", reloadSandboxes);

    return () => watcher.close();
  }, [pattern, watch]);

  useInput(async (input, key) => {
    if (input === "q" || (key.ctrl && input === "c")) {
      exit();
    }

    if (input === "j" || key.downArrow) {
      const currentIndex = sandboxes.indexOf(selectedId);
      const nextIndex = Math.min(currentIndex + 1, sandboxes.length - 1);
      setSelectedId(sandboxes[nextIndex]);
    } else if (input === "k" || key.upArrow) {
      const currentIndex = sandboxes.indexOf(selectedId);
      const prevIndex = Math.max(currentIndex - 1, 0);
      setSelectedId(sandboxes[prevIndex]);
    }
  });

  if (sandboxes.length === 0) {
    return h(
      Box,
      { flexDirection: "column" },
      h(Text, { color: "red" }, "No sandboxes found"),
      h(Text, { color: "gray" }, `Pattern: ${pattern}`),
    );
  }

  return h(SandboxList, { sandboxes, selectedId });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    return console.log(HELP_TEXT);
  }

  const watch = args.includes("--watch") || args.includes("-w");
  const pattern = args.find((arg) => !arg.startsWith("--")) || DEFAULT_PATTERN;

  process.stdout.write("\x1b[?1049h");
  clear();

  const initialSandboxes = await loadSandboxes(pattern);
  render(h(App, { pattern, watch, initialSandboxes }));
}

main();
