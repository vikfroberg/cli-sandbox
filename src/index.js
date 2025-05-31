#!/usr/bin/env node

function clearScreen() {
  process.stdout.write("\x1b[2J\x1b[H");
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    const model = Help.init();
    Help.render(model)
      .split("\n")
      .forEach((line) => console.log(line));
    return;
  }

  const pattern = args[0] || DEFAULT_PATTERN;

  // TEA architecture setup
  let currentModel = await App.init();
  function dispatch(msg) {
    const newModel = App.update(currentModel, msg);
    currentModel = newModel;
  }

  clearScreen();
  App.render(currentModel)
    .split("\n")
    .forEach((line) => console.log(line));

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  // Handle subscriptions for key presses and watch
  process.stdin.on("data", (key) => {
    dispatch({ type: "keyPress", key });
  });

  process.on("SIGINT", () => {
    process.exit(0);
  });
}

// Pure TEA application - no exports needed

main();
