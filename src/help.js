import { DEFAULT_PATTERN } from "./shared.js";

const HELP_TEXT = `
Usage: CLI Playground [pattern]

CLI Playground - Interactive visual testing environment for CLI error messages
and formatting with live reload capabilities

Arguments:
  pattern                         Glob pattern for sandbox files (default: ${DEFAULT_PATTERN})

Commands:
  /help                           Show this help
  /focus [query]                  Focus on specific examples (fuzzy search)
  /sandboxes                      List all sandbox files
  /switch <file>                  Switch to a different sandbox
  /clear                          Clear screen and re-render
  /exit                           Exit playground

Navigation:
  ↑/↓ or j/k                      Navigate examples
  Enter                           Select/focus example
  Esc                             Back/exit focus
  q                               Quit application
  h                               Show help (in sandbox view)

Examples:
  playground                      Find all ${DEFAULT_PATTERN} files
  playground "**/*_test.mjs"      Custom pattern
`;

export function showHelp() {
  console.log(HELP_TEXT);
}

