import chalk from "chalk";
import path from "node:path";
import {
  HELP_TEXT,
  calculateVisibleWindow,
  getMaxVisibleItems,
  getMaxVisibleExamples,
  getTerminalWidth,
} from "./shared.js";

// Screen constructors
export function createSandboxesScreen(selectedIndex = 0) {
  return {
    type: "SandboxesScreen",
    selectedIndex,
  };
}

export function createSandboxScreen(sandboxId, examples, selectedIndex = 0) {
  return {
    type: "SandboxScreen",
    sandboxId,
    examples,
    selectedIndex,
  };
}

export function createSandboxExampleScreen(sandboxId, example) {
  return {
    type: "SandboxExampleScreen",
    sandboxId,
    example,
  };
}

// TEA functions
export async function init(pattern, { findSandboxFiles }) {
  const sandboxFiles = await findSandboxFiles(pattern);
  return {
    pattern,
    sandboxFiles,
    screen: createSandboxesScreen(),
  };
}

export function update(msg, model) {
  switch (msg.type) {
    case "KeyPress":
      return updateKeyPress(model, msg.key);
    case "FileChanged":
      return updateFileChanged(model, msg.file);
    case "FileAdded":
      return updateFileAdded(model, msg.files);
    case "FileRemoved":
      return updateFileRemoved(model, msg.file);
    default:
      return model;
  }
}

export function subscriptions(model, { watchFiles, keyPress }, dispatch) {
  const subs = [keyPress(dispatch)];

  // Only watch files when viewing a sandbox
  if (
    model.screen.type === "SandboxScreen" ||
    model.screen.type === "SandboxExampleScreen"
  ) {
    subs.push(
      watchFiles(
        model.pattern,
        {
          change: (file) => dispatch({ type: "FileChanged", file }),
          add: (files) => dispatch({ type: "FileAdded", files }),
        },
        dispatch,
      ),
    );
  }

  return subs;
}

export function render(model, dispatch) {
  const content =
    model.screen.type === "SandboxesScreen"
      ? renderWelcomeScreen(model)
      : renderSandboxScreen(model);

  content.split("\n").forEach((line) => console.log(line));
}

// Update functions
function updateKeyPress(model, key) {
  switch (model.screen.type) {
    case "SandboxesScreen":
      return updateSandboxesScreenKeyPress(model, key);
    case "SandboxScreen":
      return updateSandboxScreenKeyPress(model, key);
    case "SandboxExampleScreen":
      return updateSandboxExampleScreenKeyPress(model, key);
    default:
      return model;
  }
}

function updateSandboxesScreenKeyPress(model, key) {
  switch (key) {
    case "\u0003": // CTRL_C
    case "q":
      process.exit(0);
      return model;
    case "\u001b[A": // UP_ARROW
    case "k":
      return updateMoveSandboxSelection(model, "up");
    case "\u001b[B": // DOWN_ARROW
    case "j":
      return updateMoveSandboxSelection(model, "down");
    case "\r": // ENTER
      return updateSelectSandbox(model);
    default:
      return model;
  }
}

function updateSandboxScreenKeyPress(model, key) {
  switch (key) {
    case "\u0003": // CTRL_C
    case "q":
      process.exit(0);
      return model;
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
      return model;
  }
}

function updateSandboxExampleScreenKeyPress(model, key) {
  switch (key) {
    case "\u0003": // CTRL_C
    case "q":
      process.exit(0);
      return model;
    case "\r": // ENTER
    case "\u001b": // ESCAPE
      return updateToggleFocus(model);
    default:
      return model;
  }
}

function updateMoveSandboxSelection(model, direction) {
  const currentIndex = model.screen.selectedIndex;
  const maxIndex = model.sandboxFiles.length - 1;

  let newIndex;
  if (direction === "up") {
    newIndex = Math.max(0, currentIndex - 1);
  } else {
    newIndex = Math.min(maxIndex, currentIndex + 1);
  }

  return {
    ...model,
    screen: {
      ...model.screen,
      selectedIndex: newIndex,
    },
  };
}

function updateMoveExampleSelection(model, direction) {
  const currentIndex = model.screen.selectedIndex;
  const maxIndex = model.screen.examples.length - 1;

  let newIndex;
  if (direction === "up") {
    newIndex = Math.max(0, currentIndex - 1);
  } else {
    newIndex = Math.min(maxIndex, currentIndex + 1);
  }

  return {
    ...model,
    screen: {
      ...model.screen,
      selectedIndex: newIndex,
    },
  };
}

async function updateSelectSandbox(model) {
  const selectedFile = model.sandboxFiles[model.screen.selectedIndex];

  try {
    const module = await import(`file://${selectedFile}?t=${Date.now()}`);
    const examples = (module.default || []).map((example, index) => ({
      id: `${selectedFile}-${index}`,
      index,
      example,
      filePath: selectedFile,
    }));

    return {
      ...model,
      screen: createSandboxScreen(selectedFile, examples),
    };
  } catch (error) {
    console.error(chalk.red("Error loading sandbox:"), error.message);
    return model;
  }
}

function updateToggleFocus(model) {
  if (model.screen.type === "SandboxScreen") {
    const selectedExample = model.screen.examples[model.screen.selectedIndex];
    return {
      ...model,
      screen: createSandboxExampleScreen(
        model.screen.sandboxId,
        selectedExample,
      ),
    };
  } else if (model.screen.type === "SandboxExampleScreen") {
    // Return to sandbox screen - we need to reload the examples
    return updateSelectSandbox({
      ...model,
      screen: createSandboxesScreen(),
      sandboxFiles: model.sandboxFiles.filter(
        (f) => f === model.screen.sandboxId,
      ),
    });
  }
  return model;
}

function updateReturnToWelcome(model) {
  return {
    ...model,
    screen: createSandboxesScreen(),
  };
}

function updateFileChanged(model, file) {
  if (
    model.screen.type === "SandboxScreen" &&
    model.screen.sandboxId === file
  ) {
    // Reload the current sandbox
    return updateSelectSandbox({
      ...model,
      screen: createSandboxesScreen(),
      sandboxFiles: model.sandboxFiles.filter((f) => f === file),
    });
  }
  return model;
}

function updateFileAdded(model, files) {
  return {
    ...model,
    sandboxFiles: [...new Set([...model.sandboxFiles, ...files])].sort(),
  };
}

function updateFileRemoved(model, file) {
  return {
    ...model,
    sandboxFiles: model.sandboxFiles.filter((f) => f !== file),
  };
}

// Render functions
function renderWelcomeScreen(model) {
  const lines = [];
  const maxVisible = getMaxVisibleItems();

  // Calculate visible window for scrolling
  const window = calculateVisibleWindow(
    model.sandboxFiles,
    model.screen.selectedIndex,
    maxVisible,
  );

  lines.push(chalk.bold("CLI Playground"));
  lines.push("");
  lines.push(chalk.gray("Select a sandbox to explore:"));
  lines.push("");

  // Show scroll up indicator
  if (window.showScrollUp) {
    lines.push(chalk.gray("  ↑ (" + window.startIndex + " more above)"));
  }

  // Render visible items
  window.visibleItems.forEach((file, arrayIndex) => {
    const actualIndex = window.startIndex + arrayIndex;
    const fileName = path.relative(process.cwd(), file);
    const isSelected = actualIndex === model.screen.selectedIndex;

    const marker = isSelected ? chalk.blue("▶ ") : "  ";
    const name = isSelected ? chalk.bold.blue(fileName) : chalk.white(fileName);

    lines.push(`${marker}${name}`);
  });

  // Show scroll down indicator
  if (window.showScrollDown) {
    const remaining = model.sandboxFiles.length - window.endIndex - 1;
    lines.push(chalk.gray("  ↓ (" + remaining + " more below)"));
  }

  lines.push("");

  // Add scroll position if scrolling is active
  if (window.showScrollUp || window.showScrollDown) {
    lines.push(chalk.gray(`Position: ${window.scrollPosition}`));
  }

  lines.push(chalk.gray(HELP_TEXT.WELCOME));

  return lines.join("\n");
}

function renderSandboxScreen(model) {
  const lines = [];

  const header = buildHeader(model);
  lines.push(header);
  lines.push("");

  if (model.screen.type === "SandboxExampleScreen") {
    lines.push(renderSingleExample(model.screen.example));
  } else if (model.screen.type === "SandboxScreen") {
    if (model.screen.examples.length === 0) {
      lines.push(chalk.yellow("No examples to display"));
    } else {
      lines.push(renderExamples(model));
    }
  }

  lines.push("");
  lines.push(renderHelpText(model));

  return lines.join("\n");
}

function buildHeader(model) {
  const title = chalk.bold.blue("🎮 CLI Playground");
  let sandbox = "";
  let mode = "";

  if (
    model.screen.type === "SandboxScreen" ||
    model.screen.type === "SandboxExampleScreen"
  ) {
    sandbox = chalk.gray(` - ${model.screen.sandboxId.split("/").pop()}`);
    if (model.screen.type === "SandboxExampleScreen") {
      mode = chalk.yellow(" [FOCUSED]");
    }
  }

  return title + sandbox + mode;
}

function renderSingleExample(exampleItem) {
  const { example } = exampleItem;
  const lines = [];

  const name = example.name || "Example";
  lines.push(`  ${chalk.bold.yellow(name)}`);

  if (example.description) {
    lines.push(`    ${chalk.white(example.description)}`);
  }

  lines.push("");
  lines.push(renderExampleContent(example));

  return lines.join("\n");
}

function renderExamples(model) {
  const lines = [];
  const maxVisible = getMaxVisibleExamples();

  // Only use scrolling if there are more examples than can fit
  if (model.screen.examples.length <= maxVisible) {
    // Render all examples if they fit
    model.screen.examples.forEach((item, index) => {
      const { example } = item;
      const isSelected = index === model.screen.selectedIndex;

      lines.push(renderExampleHeader(index, example, isSelected));
      lines.push(renderExampleContent(example));

      if (index < model.screen.examples.length - 1) {
        lines.push(renderSeparator());
      }
    });
  } else {
    // Use scrolling for large lists
    const window = calculateVisibleWindow(
      model.screen.examples,
      model.screen.selectedIndex,
      maxVisible,
    );

    // Show scroll up indicator
    if (window.showScrollUp) {
      lines.push(chalk.gray("  ↑ (" + window.startIndex + " more above)"));
      lines.push("");
    }

    // Render visible examples
    window.visibleItems.forEach((item, arrayIndex) => {
      const actualIndex = window.startIndex + arrayIndex;
      const { example } = item;
      const isSelected = actualIndex === model.screen.selectedIndex;

      lines.push(renderExampleHeader(actualIndex, example, isSelected));
      lines.push(renderExampleContent(example));

      if (arrayIndex < window.visibleItems.length - 1) {
        lines.push(renderSeparator());
      }
    });

    // Show scroll down indicator
    if (window.showScrollDown) {
      const remaining = model.screen.examples.length - window.endIndex - 1;
      lines.push("");
      lines.push(chalk.gray("  ↓ (" + remaining + " more below)"));
    }

    // Add scroll position if scrolling is active
    lines.push("");
    lines.push(chalk.gray(`Position: ${window.scrollPosition}`));
  }

  return lines.join("\n");
}

function renderExampleHeader(exampleIndex, example, isSelected) {
  const lines = [];
  const marker = isSelected ? chalk.blue("▶ ") : "  ";
  const exampleNumber = `[${exampleIndex + 1}]`;
  const numberColor = isSelected ? chalk.bold.blue : chalk.gray;

  const name = example.name || `Example ${exampleIndex + 1}`;
  const nameColor = isSelected ? chalk.bold.yellow : chalk.yellow;

  lines.push(`${marker}${numberColor(exampleNumber)} ${nameColor(name)}`);

  if (example.description) {
    const descColor = isSelected ? chalk.white : chalk.gray;
    lines.push(`    ${descColor(example.description)}`);
  }

  lines.push("");
  return lines.join("\n");
}

function renderExampleContent(example) {
  if (typeof example.render === "function") {
    try {
      // Capture the output from the render function
      const originalLog = console.log;
      const originalError = console.error;
      const originalWrite = process.stdout.write;
      const originalErrorWrite = process.stderr.write;
      const output = [];

      // Capture all output methods
      console.log = (...args) => output.push(args.join(" "));
      console.error = (...args) => output.push(args.join(" "));
      process.stdout.write = (chunk) => {
        output.push(chunk.toString());
        return true;
      };
      process.stderr.write = (chunk) => {
        output.push(chunk.toString());
        return true;
      };

      example.render();

      // Restore all original methods
      console.log = originalLog;
      console.error = originalError;
      process.stdout.write = originalWrite;
      process.stderr.write = originalErrorWrite;

      const result = output.join("").trim();
      return result || "[No output]";
    } catch (error) {
      return chalk.red("Error rendering example: ") + error.message;
    }
  } else if (example.message) {
    return example.message;
  }
  return "";
}

function renderSeparator() {
  const lines = [];
  lines.push("");
  lines.push(chalk.gray("─".repeat(getTerminalWidth())));
  lines.push("");
  return lines.join("\n");
}

function renderHelpText(model) {
  if (model.screen.type === "SandboxExampleScreen") {
    return chalk.gray(HELP_TEXT.FOCUSED);
  } else if (model.screen.type === "SandboxScreen") {
    return chalk.gray(HELP_TEXT.SANDBOX);
  }
  return "";
}
