// Command types for side effects in TEA pattern

export const CMD_TYPES = {
  RENDER: 'RENDER',
  CLEAR_SCREEN: 'CLEAR_SCREEN',
  DISCOVER_SANDBOXES: 'DISCOVER_SANDBOXES',
  LOAD_SANDBOX: 'LOAD_SANDBOX',
  SETUP_WATCHER: 'SETUP_WATCHER',
  CLOSE_WATCHER: 'CLOSE_WATCHER',
  EXIT: 'EXIT',
  NONE: 'NONE',
  BATCH: 'BATCH',
};

// Command constructors
export function cmdRender(content) {
  return {
    type: CMD_TYPES.RENDER,
    content,
  };
}

export function cmdClearScreen() {
  return {
    type: CMD_TYPES.CLEAR_SCREEN,
  };
}

export function cmdDiscoverSandboxes(pattern) {
  return {
    type: CMD_TYPES.DISCOVER_SANDBOXES,
    pattern,
  };
}

export function cmdLoadSandbox(filePath) {
  return {
    type: CMD_TYPES.LOAD_SANDBOX,
    filePath,
  };
}

export function cmdSetupWatcher(pattern) {
  return {
    type: CMD_TYPES.SETUP_WATCHER,
    pattern,
  };
}

export function cmdCloseWatcher() {
  return {
    type: CMD_TYPES.CLOSE_WATCHER,
  };
}

export function cmdExit() {
  return {
    type: CMD_TYPES.EXIT,
  };
}

export function cmdNone() {
  return {
    type: CMD_TYPES.NONE,
  };
}

export function cmdBatch(commands) {
  return {
    type: CMD_TYPES.BATCH,
    commands,
  };
}

// Utility to combine render and clear screen
export function cmdRenderWithClear(content) {
  return cmdBatch([
    cmdClearScreen(),
    cmdRender(content),
  ]);
}