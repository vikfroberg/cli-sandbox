import React, { createElement as h, useState, useEffect } from "react";
import { render, Text, Box, useInput, useApp } from "ink";
import clear from "clear";
import { glob } from "glob";
import path from "path";
import { HELP_TEXT } from "./help.js";
import { DEFAULT_PATTERN } from "./shared.js";
import chokidar from "chokidar";
import * as esbuild from "esbuild";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class SandboxLoader {
  constructor() {
    this.tempDir = path.join(__dirname, ".temp-bundles");
    this.bundleCounter = 0;
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async bundleSandbox(filePath) {
    try {
      const bundleId = ++this.bundleCounter;
      const outputPath = path.join(this.tempDir, `bundle-${bundleId}.js`);

      // Bundle the file and all its dependencies
      const result = await esbuild.build({
        entryPoints: [filePath],
        bundle: true,
        format: "esm",
        platform: "node",
        target: "node18",
        outfile: outputPath,
        write: true,
        external: ["react", "ink"], // Don't bundle these
        metafile: true,
        sourcemap: false,
        minify: false,
        keepNames: true,
      });

      // Extract all dependencies from metafile for watching
      const dependencies = [];
      if (result.metafile) {
        for (const inputPath of Object.keys(result.metafile.inputs)) {
          const resolvedPath = path.resolve(inputPath);
          if (!resolvedPath.includes("node_modules")) {
            dependencies.push(resolvedPath);
          }
        }
      }

      return { outputPath, dependencies };
    } catch (error) {
      console.error(`ESBuild bundling failed for ${filePath}:`, error);
      throw error;
    }
  }

  async loadSandbox(file) {
    try {
      const fullPath = path.resolve(file);
      const relativePath = path.relative(process.cwd(), fullPath);

      // Bundle the sandbox file
      const bundleResult = await this.bundleSandbox(fullPath);

      // Import the bundled version
      const moduleUrl = `file://${bundleResult.outputPath}`;
      const module = await import(moduleUrl);
      const examples = module.default || [];

      return {
        absolutePath: fullPath,
        path: relativePath,
        examples,
        bundlePath: bundleResult.outputPath,
        dependencies: bundleResult.dependencies, // Include dependencies for watching
      };
    } catch (error) {
      console.error(`Failed to load ${file}:`, error.message);
      return {
        path: path.relative(process.cwd(), path.resolve(file)),
        examples: [],
        bundlePath: null,
        dependencies: [],
      };
    }
  }

  cleanup() {
    // Clean up old bundle files
    try {
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir);
        for (const file of files) {
          fs.unlinkSync(path.join(this.tempDir, file));
        }
      }
    } catch (error) {
      console.warn("Failed to cleanup temp files:", error.message);
    }
  }
}

// Global loader instance
const sandboxLoader = new SandboxLoader();

// Cleanup on exit
process.on("exit", () => sandboxLoader.cleanup());
process.on("SIGINT", () => {
  sandboxLoader.cleanup();
  process.exit();
});

async function loadSandbox(file) {
  return sandboxLoader.loadSandbox(file);
}

async function loadSandboxes(pattern) {
  const files = await glob(pattern, { cwd: process.cwd() });
  const sandboxes = [];

  for (const file of files) {
    const sandbox = await loadSandbox(file);
    sandboxes.push(sandbox);
  }

  return sandboxes;
}

function SandboxList({
  sandboxes,
  watch = false,
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
      h(Text, { bold: true }, `Sandboxes${watch ? " (watching)" : ""}`),
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

function ExampleDetail({
  sandbox,
  exampleId,
  watch,
  onExampleChanged,
  onBack,
}) {
  const example = sandbox?.examples.find((e) => e.name === exampleId);

  useEffect(() => {
    if (watch && sandbox?.dependencies) {
      // Watch all dependencies discovered by esbuild
      let watcher = chokidar.watch(sandbox.dependencies, {
        ignoreInitial: true,
      });

      async function exampleChanged() {
        watcher.close();

        // Trigger reload with fresh bundle
        onExampleChanged();
      }

      watcher.on("change", exampleChanged);
      watcher.on("add", exampleChanged);
      watcher.on("unlink", exampleChanged);

      return () => watcher.close();
    }
  }, [watch, sandbox?.dependencies, onExampleChanged]);

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

  useEffect(() => {
    async function reloadSandboxes() {
      const loadedSandboxes = await loadSandboxes(pattern);
      setSandboxes(loadedSandboxes);
    }
    reloadSandboxes();
  }, [pattern, watch, currentScreen]);

  useInput(async (input, key) => {
    if (input === "q" || (key.ctrl && input === "c")) {
      exit();
    }
  });

  switch (currentScreen.type) {
    case "sandboxes":
      return h(SandboxList, {
        watch,
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
    case "example": {
      let sandbox = sandboxes.find(
        (s) => s.path === currentScreen.selectedSandboxId,
      );
      return h(ExampleDetail, {
        sandbox,
        exampleId: currentScreen.selectedExampleId,
        watch,
        onExampleChanged: async () => {
          // Create a fresh bundle when files change
          const reloadedSandbox = await loadSandbox(sandbox.absolutePath);
          setSandboxes(
            sandboxes.map((s) =>
              s.path === currentScreen.selectedSandboxId ? reloadedSandbox : s,
            ),
          );
        },
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

main().catch(console.error);
