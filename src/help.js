import { DEFAULT_PATTERN } from "./shared.js";

export const HELP_TEXT = `
Usage: playground [pattern]

Playground - interactive visual testing environment for CLI rendering

Arguments:
  pattern                         Glob pattern for sandbox files (default: ${DEFAULT_PATTERN})

Options:
  -h, --help                     Show this help
  -w, --watch                    Watch files for changes

Examples:
  playground                      Find all ${DEFAULT_PATTERN} files
  playground "**/*_test.mjs"      Custom pattern
`.trim();
