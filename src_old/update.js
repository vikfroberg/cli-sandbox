import {
  cmdRenderWithClear,
  cmdDiscoverSandboxes,
  cmdLoadSandbox,
  cmdSetupWatcher,
  cmdCloseWatcher,
  cmdExit,
  cmdNone,
  cmdBatch,
} from "./commands.js";
import { renderWelcomeScreen, render } from "./renderer.js";

// Screen constructors
export function createSandboxesScreen(selectedSandboxId = null) {
  return {
    type: "SandboxesScreen",
    selectedSandboxId,
  };
}

export function createSandboxScreen(sandboxId, selectedExampleId = null) {
  return {
    type: "SandboxScreen",
    sandboxId,
    selectedExampleId,
  };
}

export function createSandboxExampleScreen(exampleId) {
  return {
    type: "SandboxExampleScreen",
    exampleId,
  };
}

// Update functions that return [model, command] tuples

export async function init(pattern) {
  const sandboxFiles = await findSandboxFiles(pattern);
  const model = {
    pattern,
    sandboxFiles,
    screen: createSandboxesScreen(),
  };

  return model;
}

function update(msg, model) {
  switch (msg.type) {
    case "SelectSandbox":
      return updateSelectSandbox(model);
    case "SelectExample":
      return updateSelectExample(model);
    case "BackPressed":
      return updateBackPressed(model);
    case "QuitPressed":
      return updateQuitPressed(model);
    case "FileChanged":
      return updateFileChanged(model);
    case "FileAdded":
      return updateFileAdded(model);
    case "FileRemoved":
      return updateFileRemoved(model);
    default:
      throw new Error(`Unknown message type: ${msg.type}`);
  }
}

export function updateLoadSandbox(model, filePath, examples) {
  const processedExamples = examples.map((example, index) => ({
    id: `${filePath}-${index}`,
    index,
    example,
    filePath,
  }));

  const newModel = {
    ...model,
    screen: createSandboxScreen(filePath, processedExamples),
  };

  return [
    newModel,
    cmdBatch([
      cmdSetupWatcher(model.pattern),
      cmdRenderWithClear(render(newModel)),
    ]),
  ];
}

export function updateSelectSandbox(model) {
  const selectedFile = model.screen.sandboxFiles[model.screen.selectedIndex];
  return [model, cmdLoadSandbox(selectedFile)];
}

export function updateToggleFocus(model) {
  if (model.screen.type === "SandboxScreen") {
    const selectedExample = model.screen.examples[model.screen.selectedIndex];
    const newModel = {
      ...model,
      screen: createSandboxExampleScreen(model.screen.sandbox, selectedExample),
    };
    return [newModel, cmdRenderWithClear(render(newModel))];
  } else if (model.screen.type === "SandboxExampleScreen") {
    return [model, cmdLoadSandbox(model.screen.sandbox)];
  }

  return [model, cmdNone()];
}

export function updateReturnToWelcome(model, sandboxFiles) {
  const newModel = {
    ...model,
    screen: createSandboxesScreen(sandboxFiles || [], 0),
  };

  return [
    newModel,
    cmdBatch([cmdCloseWatcher(), cmdDiscoverSandboxes(model.pattern)]),
  ];
}

export function updateMoveSandboxSelection(model, direction) {
  const currentIndex = model.screen.selectedIndex;
  const maxIndex = model.screen.sandboxFiles.length - 1;

  let newIndex;
  if (direction === "up") {
    newIndex = Math.max(0, currentIndex - 1);
  } else {
    newIndex = Math.min(maxIndex, currentIndex + 1);
  }

  const newModel = {
    ...model,
    screen: {
      ...model.screen,
      selectedIndex: newIndex,
    },
  };

  return [newModel, cmdRenderWithClear(renderWelcomeScreen(newModel))];
}

export function updateMoveExampleSelection(model, direction) {
  const currentIndex = model.screen.selectedIndex;
  const maxIndex = model.screen.examples.length - 1;

  let newIndex;
  if (direction === "up") {
    newIndex = Math.max(0, currentIndex - 1);
  } else {
    newIndex = Math.min(maxIndex, currentIndex + 1);
  }

  const newModel = {
    ...model,
    screen: {
      ...model.screen,
      selectedIndex: newIndex,
    },
  };

  return [newModel, cmdRenderWithClear(render(newModel))];
}

export function updateKeyPress(model, key) {
  switch (model.screen.type) {
    case "SandboxesScreen":
      return updateSandboxesScreenKeyPress(model, key);
    case "SandboxScreen":
      return updateSandboxScreenKeyPress(model, key);
    case "SandboxExampleScreen":
      return updateSandboxExampleScreenKeyPress(model, key);
    default:
      return [model, cmdNone()];
  }
}

function updateSandboxesScreenKeyPress(model, key) {
  switch (key) {
    case "\u0003": // CTRL_C
    case "q":
      return [model, cmdExit()];
    case "\u001b[A": // UP_ARROW
    case "k":
      return updateMoveSandboxSelection(model, "up");
    case "\u001b[B": // DOWN_ARROW
    case "j":
      return updateMoveSandboxSelection(model, "down");
    case "\r": // ENTER
      return updateSelectSandbox(model);
    default:
      return [model, cmdNone()];
  }
}

function updateSandboxScreenKeyPress(model, key) {
  switch (key) {
    case "\u0003": // CTRL_C
    case "q":
      return [model, cmdExit()];
    case "\u001b[A": // UP_ARROW
    case "k":
      return updateMoveExampleSelection(model, "up");
    case "\u001b[B": // DOWN_ARROW
    case "j":
      return updateMoveExampleSelection(model, "down");
    case "\r": // ENTER
      return updateToggleFocus(model);
    case "\u001b": // ESCAPE
      return updateReturnToWelcome(model);
    default:
      return [model, cmdNone()];
  }
}

function updateSandboxExampleScreenKeyPress(model, key) {
  switch (key) {
    case "\u0003": // CTRL_C
    case "q":
      return [model, cmdExit()];
    case "\r": // ENTER
    case "\u001b": // ESCAPE
      return updateToggleFocus(model);
    default:
      return [model, cmdNone()];
  }
}

