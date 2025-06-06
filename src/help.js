export default function help(pattern) {
  return `
Usage: sandbox [pattern]

Sandbox - interactive visual testing environment for CLI rendering

Arguments:
  pattern                         Glob pattern for sandbox files (default: ${DEFAULT_PATTERN})

Options:
  -h, --help                     Show this help
  -w, --watch                    Watch files for changes

Examples:
  sandbox                      Find all ${pattern} files
  sandbox "**/*_test.mjs"      Custom pattern
`.trim();
}
