export function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[H');
}

export function moveCursor(x, y) {
  process.stdout.write(`\x1b[${y};${x}H`);
}

export function hideCursor() {
  process.stdout.write('\x1b[?25l');
}

export function showCursor() {
  process.stdout.write('\x1b[?25h');
}

export function clearLine() {
  process.stdout.write('\x1b[K');
}

export function saveCursor() {
  process.stdout.write('\x1b[s');
}

export function restoreCursor() {
  process.stdout.write('\x1b[u');
}