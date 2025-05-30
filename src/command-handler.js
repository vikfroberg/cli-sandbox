import chalk from "chalk";
import Fuse from "fuse.js";
import { HELP_TEXT } from "./constants.js";

const COMMANDS = {
  HELP: "/help",
  FOCUS: "/focus",
  SANDBOXES: "/sandboxes",
  SWITCH: "/switch",
  CLEAR: "/clear",
  EXIT: "/exit",
};

export class CommandHandler {
  constructor(playground) {
    this.playground = playground;
  }

  handleCommand(input) {
    const trimmed = input.trim();

    if (trimmed === COMMANDS.HELP) {
      this.showHelp();
      return true;
    }

    if (trimmed === COMMANDS.SANDBOXES) {
      this.showSandboxes();
      return true;
    }

    if (trimmed === COMMANDS.CLEAR) {
      this.playground.render();
      return true;
    }

    if (trimmed === COMMANDS.EXIT) {
      this.playground.cleanup();
      return true;
    }

    if (trimmed.startsWith(COMMANDS.FOCUS)) {
      const query = trimmed.slice(COMMANDS.FOCUS.length).trim();
      this.handleFocus(query);
      return true;
    }

    if (trimmed.startsWith(COMMANDS.SWITCH)) {
      const fileName = trimmed.slice(COMMANDS.SWITCH.length).trim();
      this.handleSwitch(fileName);
      return true;
    }

    return false;
  }

  showHelp() {
    console.log(HELP_TEXT.FULL);
  }

  handleFocus(query) {
    if (!query) {
      this.playground.focusedExample = null;
      this.playground.render();
      return;
    }

    const fuse = new Fuse(this.playground.examples, {
      keys: ["example.name", "example.description"],
      threshold: 0.3,
    });

    const results = fuse.search(query);

    if (results.length > 0) {
      this.playground.focusedExample = results[0].item;
      console.log(
        chalk.green("Focused on:"),
        this.playground.focusedExample.example.name ||
          `Example ${this.playground.focusedExample.index}`,
      );
    } else {
      console.log(chalk.yellow("No matching examples found for:"), query);
    }

    this.playground.render();
  }

  showSandboxes() {
    console.log("\n" + chalk.bold("Available Sandboxes:"));
    this.playground.sandboxFiles.forEach((file, index) => {
      const marker =
        file === this.playground.currentSandbox
          ? chalk.green("●")
          : chalk.gray("○");
      console.log(`${marker} ${chalk.cyan(file.split("/").pop())}`);
    });
    console.log();
  }

  async handleSwitch(fileName) {
    const targetFile = this.playground.sandboxFiles.find(
      (f) => f.includes(fileName) || f.endsWith(fileName),
    );

    if (targetFile) {
      await this.playground.loadSandbox(targetFile);
      this.playground.focusedExample = null;
      this.playground.render();
      console.log(chalk.green("Switched to:"), targetFile.split("/").pop());
    } else {
      console.log(chalk.red("Sandbox not found:"), fileName);
      this.showSandboxes();
    }
  }
}
