const KEY_CODES = {
  CTRL_C: "\u0003",
  CTRL_J: "\u000a",
  CTRL_K: "\u000b",
  ENTER: "\r",
  ESCAPE: "\u001b",
  UP_ARROW: "\u001b[A",
  DOWN_ARROW: "\u001b[B",
};

export class KeyboardHandler {
  constructor(playground) {
    this.playground = playground;
  }

  handleKeyPress(key) {
    if (this.playground.isWelcomeScreen) {
      this.handleWelcomeKeyPress(key);
    } else {
      this.handleSandboxKeyPress(key);
    }
  }

  handleWelcomeKeyPress(key) {
    switch (key) {
      case KEY_CODES.CTRL_C:
      case "q":
        this.playground.cleanup();
        break;
      case KEY_CODES.UP_ARROW:
      case KEY_CODES.CTRL_K:
        this.moveSelectionUp();
        this.playground.renderer.renderWelcomeScreen();
        break;
      case KEY_CODES.DOWN_ARROW:
      case KEY_CODES.CTRL_J:
        this.moveSelectionDown();
        this.playground.renderer.renderWelcomeScreen();
        break;
      case KEY_CODES.ENTER:
        this.playground.selectSandbox();
        break;
    }
  }

  handleSandboxKeyPress(key) {
    switch (key) {
      case KEY_CODES.CTRL_C:
      case "q":
        this.playground.cleanup();
        break;
      case KEY_CODES.UP_ARROW:
      case KEY_CODES.CTRL_K:
        if (!this.playground.isFocusedMode) {
          this.moveExampleSelectionUp();
          this.playground.renderer.render();
        }
        break;
      case KEY_CODES.DOWN_ARROW:
      case KEY_CODES.CTRL_J:
        if (!this.playground.isFocusedMode) {
          this.moveExampleSelectionDown();
          this.playground.renderer.render();
        }
        break;
      case KEY_CODES.ENTER:
        this.playground.toggleFocus();
        break;
      case KEY_CODES.ESCAPE:
        if (this.playground.isFocusedMode) {
          this.playground.isFocusedMode = false;
          this.playground.renderer.render();
        } else {
          this.playground.returnToWelcome();
        }
        break;
      case "h":
        this.playground.commandHandler.showHelp();
        break;
    }
  }

  moveSelectionUp() {
    this.playground.selectedSandboxIndex = Math.max(
      0,
      this.playground.selectedSandboxIndex - 1,
    );
  }

  moveSelectionDown() {
    this.playground.selectedSandboxIndex = Math.min(
      this.playground.sandboxFiles.length - 1,
      this.playground.selectedSandboxIndex + 1,
    );
  }

  moveExampleSelectionUp() {
    this.playground.selectedExampleIndex = Math.max(
      0,
      this.playground.selectedExampleIndex - 1,
    );
  }

  moveExampleSelectionDown() {
    this.playground.selectedExampleIndex = Math.min(
      this.playground.examples.length - 1,
      this.playground.selectedExampleIndex + 1,
    );
  }
}
