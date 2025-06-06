import React, { createElement as h, useState, useEffect } from "react";
import { Text, Box, useInput, useApp } from "ink";
import chokidar from "chokidar";
import { loadSandboxes, loadSandbox } from "./utils.js";

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
    } else if (input === "-" || key.escape) {
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
  exampleId: initialExampleId,
  watch,
  onExampleChanged,
  onBack,
}) {
  const [exampleId, setExampleId] = useState(initialExampleId);
  const example = sandbox?.examples.find((e) => e.name === exampleId);

  useEffect(() => {
    if (watch && sandbox?.dependencies) {
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
    if (input === "-" || key.escape) {
      onBack(exampleId);
    }

    if (input === "j" || key.downArrow) {
      // next example
      let currentIndex = sandbox.examples.findIndex(
        (e) => e.name === exampleId,
      );
      let nestIndex = Math.min(currentIndex + 1, sandbox.examples.length - 1);
      setExampleId(sandbox.examples[nestIndex]?.name);
    }

    if (input === "k" || key.upArrow) {
      // previous example
      let currentIndex = sandbox.examples.findIndex(
        (e) => e.name === exampleId,
      );
      let nestIndex = Math.max(currentIndex - 1, 0);
      setExampleId(sandbox.examples[nestIndex]?.name);
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
      h(
        Text,
        { color: "gray" },
        "Press - to go back, j/k to navigate, q to quit",
      ),
    ),
    h(Text, {}, example.value),
  );
}

export default function App({ initialSandboxes, pattern, watch }) {
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
        onBack: (exampleId) => {
          setCurrentScreen({
            type: "examples",
            selectedSandboxId: currentScreen.selectedSandboxId,
            selectedExampleId: exampleId,
          });
        },
      });
    }
  }
}
