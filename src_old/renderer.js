import chalk from "chalk";
import path from "node:path";
import { HELP_TEXT, SANDBOX_SUFFIX } from "./constants.js";
import { calculateVisibleWindow, getMaxVisibleItems, getMaxVisibleExamples, getTerminalWidth } from "./scrolling.js";

export function renderWelcomeScreen(state) {
  const lines = [];
  const maxVisible = getMaxVisibleItems();
  
  // Calculate visible window for scrolling
  const window = calculateVisibleWindow(
    state.page.sandboxFiles,
    state.page.selectedIndex,
    maxVisible
  );
  
  lines.push(chalk.bold("CLI Playground"));
  lines.push("");
  lines.push(chalk.gray("Select a sandbox to explore:"));
  lines.push("");

  // Show scroll up indicator
  if (window.showScrollUp) {
    lines.push(chalk.gray("  ↑ (" + (window.startIndex) + " more above)"));
  }

  // Render visible items
  window.visibleItems.forEach((file, arrayIndex) => {
    const actualIndex = window.startIndex + arrayIndex;
    const fileName = path.relative(process.cwd(), file);
    const isSelected = actualIndex === state.page.selectedIndex;

    const marker = isSelected ? chalk.blue("▶ ") : "  ";
    const name = isSelected
      ? chalk.bold.blue(fileName)
      : chalk.white(fileName);

    lines.push(`${marker}${name}`);
  });

  // Show scroll down indicator
  if (window.showScrollDown) {
    const remaining = state.page.sandboxFiles.length - window.endIndex - 1;
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

export function render(state) {
  const lines = [];
  
  const header = buildHeader(state);
  lines.push(header);
  lines.push("");

  if (state.page.type === 'SandboxExamplePage') {
    lines.push(renderSingleExample(state.page.example));
  } else if (state.page.type === 'SandboxPage') {
    if (state.page.examples.length === 0) {
      lines.push(chalk.yellow("No examples to display"));
    } else {
      lines.push(renderExamples(state));
    }
  }

  lines.push("");
  lines.push(renderHelpText(state));
  
  return lines.join("\n");
}

function buildHeader(state) {
  const title = chalk.bold.blue("🎮 CLI Playground");
  let sandbox = "";
  let mode = "";
  
  if (state.page.type === 'SandboxPage' || state.page.type === 'SandboxExamplePage') {
    sandbox = chalk.gray(` - ${state.page.sandbox.split("/").pop()}`);
    if (state.page.type === 'SandboxExamplePage') {
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

function renderExamples(state) {
  const lines = [];
  const maxVisible = getMaxVisibleExamples();
  
  // Only use scrolling if there are more examples than can fit
  if (state.page.examples.length <= maxVisible) {
    // Render all examples if they fit
    state.page.examples.forEach((item, index) => {
      const { example } = item;
      const isSelected = index === state.page.selectedIndex;

      lines.push(renderExampleHeader(index, example, isSelected));
      lines.push(renderExampleContent(example));

      if (index < state.page.examples.length - 1) {
        lines.push(renderSeparator());
      }
    });
  } else {
    // Use scrolling for large lists
    const window = calculateVisibleWindow(
      state.page.examples,
      state.page.selectedIndex,
      maxVisible
    );
    
    // Show scroll up indicator
    if (window.showScrollUp) {
      lines.push(chalk.gray("  ↑ (" + (window.startIndex) + " more above)"));
      lines.push("");
    }
    
    // Render visible examples
    window.visibleItems.forEach((item, arrayIndex) => {
      const actualIndex = window.startIndex + arrayIndex;
      const { example } = item;
      const isSelected = actualIndex === state.page.selectedIndex;

      lines.push(renderExampleHeader(actualIndex, example, isSelected));
      lines.push(renderExampleContent(example));

      if (arrayIndex < window.visibleItems.length - 1) {
        lines.push(renderSeparator());
      }
    });
    
    // Show scroll down indicator
    if (window.showScrollDown) {
      const remaining = state.page.examples.length - window.endIndex - 1;
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
      console.log = (...args) => output.push(args.join(' '));
      console.error = (...args) => output.push(args.join(' '));
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
      
      const result = output.join('').trim();
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

function renderHelpText(state) {
  if (state.page.type === 'SandboxExamplePage') {
    return chalk.gray(HELP_TEXT.FOCUSED);
  } else if (state.page.type === 'SandboxPage') {
    return chalk.gray(HELP_TEXT.SANDBOX);
  }
  return "";
}
