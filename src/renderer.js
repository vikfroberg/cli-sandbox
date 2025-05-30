import chalk from "chalk";
import path from "node:path";
import { HELP_TEXT, SANDBOX_SUFFIX } from "./constants.js";

function clearScreen() {
  process.stdout.write("\x1b[2J\x1b[H");
}

export class Renderer {
  constructor(playground) {
    this.playground = playground;
  }

  renderWelcomeScreen() {
    clearScreen();

    console.log(chalk.bold("CLI Playground"));
    console.log();
    console.log(chalk.gray("Select a sandbox to explore:\n"));

    this.playground.sandboxFiles.forEach((file, index) => {
      const fileName = path.relative(process.cwd(), file);
      const isSelected = index === this.playground.selectedSandboxIndex;

      const marker = isSelected ? chalk.blue("▶ ") : "  ";
      const name = isSelected
        ? chalk.bold.blue(fileName)
        : chalk.white(fileName);

      console.log(`${marker}${name}`);
    });

    console.log();
    console.log(chalk.gray(HELP_TEXT.WELCOME));
  }

  render() {
    clearScreen();

    const header = this.buildHeader();
    console.log(header);
    console.log();

    const examplesToRender = this.getExamplesToRender();

    if (examplesToRender.examples.length === 0) {
      console.log(chalk.yellow("No examples to display"));
    } else {
      this.renderExamples(
        examplesToRender.examples,
        examplesToRender.startIndex,
      );
    }

    console.log();
    this.renderHelpText();
  }

  buildHeader() {
    const title = chalk.bold.blue("🎮 CLI Playground");
    const sandbox = this.playground.currentSandbox
      ? chalk.gray(` - ${this.playground.currentSandbox.split("/").pop()}`)
      : "";
    const mode = this.playground.isFocusedMode
      ? chalk.yellow(" [FOCUSED]")
      : "";

    return title + sandbox + mode;
  }

  getExamplesToRender() {
    if (this.playground.isFocusedMode) {
      return {
        examples: [
          this.playground.examples[this.playground.selectedExampleIndex],
        ],
        startIndex: this.playground.selectedExampleIndex,
      };
    } else {
      return {
        examples: this.playground.examples,
        startIndex: 0,
      };
    }
  }

  renderExamples(examples, startIndex) {
    examples.forEach((item, arrayIndex) => {
      const exampleIndex = this.playground.isFocusedMode
        ? startIndex
        : arrayIndex;
      const { example } = item;
      const isSelected = exampleIndex === this.playground.selectedExampleIndex;

      this.renderExampleHeader(exampleIndex, example, isSelected);
      this.renderExampleContent(example);

      if (arrayIndex < examples.length - 1) {
        this.renderSeparator();
      }
    });
  }

  renderExampleHeader(exampleIndex, example, isSelected) {
    const marker =
      !this.playground.isFocusedMode && isSelected ? chalk.blue("▶ ") : "  ";
    const exampleNumber = `[${exampleIndex + 1}]`;
    const numberColor = isSelected ? chalk.bold.blue : chalk.gray;

    const name = example.name || `Example ${exampleIndex + 1}`;
    const nameColor = isSelected ? chalk.bold.yellow : chalk.yellow;

    console.log(`${marker}${numberColor(exampleNumber)} ${nameColor(name)}`);

    if (example.description) {
      const descColor = isSelected ? chalk.white : chalk.gray;
      console.log(`    ${descColor(example.description)}`);
    }

    console.log();
  }

  renderExampleContent(example) {
    if (typeof example.render === "function") {
      try {
        example.render();
      } catch (error) {
        console.error(chalk.red("Error rendering example:"), error.message);
      }
    } else if (example.message) {
      console.error(example.message);
    }
  }

  renderSeparator() {
    console.log();
    console.log(chalk.gray("─".repeat(process.stdout.columns)));
    console.log();
  }

  renderHelpText() {
    if (this.playground.isFocusedMode) {
      console.log(chalk.gray(HELP_TEXT.FOCUSED));
    } else {
      console.log(chalk.gray(HELP_TEXT.SANDBOX));
    }
  }
}
