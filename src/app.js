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

export async function init(pattern, { findSandboxFiles }) {
  const sandboxFiles = await findSandboxFiles(pattern);
  return {
    pattern,
    sandboxFiles,
    screen: createSandboxesScreen(),
  };
}

function update(msg, model) {
  switch (msg.type) {
    case "SelectSandbox":
      return updateSelectSandbox(model);
    case "SelectExample":
      return updateSelectExample(model);
    case "KeyPress":
      return updateKeyPress(model, msg.key);
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

function subsciptions(model, { watchFiles, keyPress }, dispatch) {
  return [
    watch(model.pattern, {
      add: files => dispatch(createFilesChanged(files))),
      change: file => dispatch(createFileChanged(file)),
    }),
    keyPress(key => dispatch(createKeyPress(key))),
  ];
}

function render(model, dispatch) {
  // TODO: render
}
