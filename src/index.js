#!/usr/bin/env node

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

      // Dynamically import the sandbox file
      const moduleUrl = `file://${fullPath}`;
      const module = await import(moduleUrl);
      const examples = module.default || [];

      sandboxes.push({ path: relativePath, examples });
    } catch (error) {
      console.error(`Failed to load ${file}:`, error.message);
      // Still add the file with empty examples if it fails to load
      sandboxes.push({
        path: path.relative(process.cwd(), path.resolve(file)),
        examples: [],
      });
    }
  }

  return sandboxes;
}

function SandboxList({
  sandboxes,
  onSandboxSelected,
  selectedSandboxId = null,
}) {
  const [maybeSelectedId, setSelectedId] = useState(selectedSandboxId);
  const selectedId = maybeSelectedId || sandboxes[0];

  useInput((input, key) => {
    if (input === "j" || key.downArrow) {
      const currentIndex = sandboxes.indexOf(selectedId);
      const nextIndex = Math.min(currentIndex + 1, sandboxes.length - 1);
      setSelectedId(sandboxes[nextIndex]);
    } else if (input === "k" || key.upArrow) {
      const currentIndex = sandboxes.indexOf(selectedId);
      const prevIndex = Math.max(currentIndex - 1, 0);
      setSelectedId(sandboxes[prevIndex]);
    } else if (key.return) {
      onSandboxSelected(selectedId);
    }
  });

  return h(
    Box,
    { gap: 1, flexDirection: "column" },
    h(
      Box,
      { flexDirection: "column" },
      h(Text, { bold: true }, "Sandboxes"),
      h(
        Text,
        { color: "gray" },
        "Use j/k to navigate, enter to select, q to quit",
      ),
    ),
    h(
      Box,
      { flexDirection: "column" },
      sandboxes.map((sandboxPath, index) => {
        const isSelected = sandboxPath === selectedId;
        return h(
          Box,
          { key: `sandbox-${index}`, flexDirection: "row", gap: 1 },
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

function ExamplesList({
  sandbox,
  onExampleSelected,
  onBack,
  selectedExampleId = null,
}) {
  const [maybeSelectedId, setSelectedId] = useState(selectedExampleId);
  const examples = sandbox?.examples || [];
  const selectedId = maybeSelectedId || examples[0]?.name;

  useInput(async (input, key) => {
    if (input === "j" || key.downArrow) {
      const currentIndex = examples.findIndex((e) => e.name === selectedId);
      const nextIndex = Math.min(currentIndex + 1, examples.length - 1);
      setSelectedId(examples[nextIndex]?.name);
    } else if (input === "k" || key.upArrow) {
      const currentIndex = examples.findIndex((e) => e.name === selectedId);
      const prevIndex = Math.max(currentIndex - 1, 0);
      setSelectedId(examples[prevIndex]?.name);
    } else if (input === "-") {
      onBack();
    } else if (key.return) {
      onExampleSelected(selectedId);
    }
  });
  return h(
    Box,
    { gap: 1, flexDirection: "column" },
    h(
      Box,
      { flexDirection: "column" },
      h(Text, { bold: true }, sandbox.path),
      h(
        Text,
        { color: "gray" },
        "Use j/k to navigate, enter to select, - to go back, q to quit",
      ),
    ),
    h(
      Box,
      { flexDirection: "column" },
      examples.map((example, index) => {
        const isSelected = example.name === selectedId;
        return h(
          Box,
          { key: `example-${index}`, flexDirection: "row", gap: 1 },
          h(Text, {}, isSelected ? "◉" : "○"),
          h(
            Box,
            { flexDirection: "column" },
            h(Text, { bold: isSelected }, example.name),
            example.description &&
              h(Text, { color: "gray" }, example.description),
          ),
        );
      }),
    ),
  );
}

function ExampleDetail({ example, onBack }) {
  useInput(async (input, key) => {
    if (
      input === "-" ||
      input === "j" ||
      key.downArrow ||
      input === "k" ||
      key.upArrow
    ) {
      onBack();
    }
  });

  return h(
    Box,
    { gap: 1, flexDirection: "column" },
    h(
      Box,
      { flexDirection: "column" },
      h(Text, { bold: true }, example.name),
      example.description && h(Text, { color: "gray" }, example.description),
      h(Text, { color: "gray" }, "Press - to go back, q to quit"),
    ),
    h(Text, {}, example.value),
  );
}

function App({ initialSandboxes, pattern, watch }) {
  const { exit } = useApp();
  const [sandboxes, setSandboxes] = useState(initialSandboxes);
  const [currentScreen, setCurrentScreen] = useState({ type: "sandboxes" });

  React.useEffect(() => {
    if (!watch) return;

    const watcher = chokidar.watch(pattern, {
      ignoreInitial: true,
      cwd: process.cwd(),
    });

    const reloadSandboxes = async () => {
      const loadedSandboxes = await loadSandboxes(pattern);
      setSandboxes(loadedSandboxes);
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
  });

  switch (currentScreen.type) {
    case "sandboxes":
      return h(SandboxList, {
        sandboxes: sandboxes.map((s) => s.path),
        selectedSandboxId: currentScreen.selectedSandboxId,
        onSandboxSelected: (sandboxPath) => {
          setCurrentScreen({
            type: "examples",
            selectedSandboxId: sandboxPath,
          });
        },
      });
    case "examples":
      return h(ExamplesList, {
        selectedExampleId: currentScreen.selectedExampleId,
        sandbox: sandboxes.find(
          (sandbox) => sandbox.path === currentScreen.selectedSandboxId,
        ),
        onExampleSelected: (exampleId) => {
          setCurrentScreen({
            type: "example",
            selectedSandboxId: currentScreen.selectedSandboxId,
            selectedExampleId: exampleId,
          });
        },
        onBack: () => {
          setCurrentScreen({
            type: "sandboxes",
            selectedSandboxId: currentScreen.selectedSandboxId,
          });
        },
      });
    case "example":
      return h(ExampleDetail, {
        example: sandboxes
          .find((s) => s.path === currentScreen.selectedSandboxId)
          ?.examples.find((e) => e.name === currentScreen.selectedExampleId),
        onBack: () => {
          setCurrentScreen({
            type: "examples",
            selectedSandboxId: currentScreen.selectedSandboxId,
            selectedExampleId: currentScreen.selectedExampleId,
          });
        },
      });
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    return console.log(HELP_TEXT);
  }

  const watch = args.includes("--watch") || args.includes("-w");
  const pattern = args.find((arg) => !arg.startsWith("--")) || DEFAULT_PATTERN;

  process.stdout.write("\x1b[?1049h"); // alternate screen
  clear();

  const initialSandboxes = await loadSandboxes(pattern);
  render(h(App, { pattern, watch, initialSandboxes }));
}

main();
