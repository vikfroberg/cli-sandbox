# CLI Sandbox

A React/Ink-based terminal application for testing and viewing CLI patterns and examples.

## Features

- 🎮 **Interactive Navigation** - Browse sandbox files and examples with keyboard navigation
- 🔄 **Live Reload** - Automatically updates when you edit sandbox files (with `--watch`)
- 📁 **Multiple Sandboxes** - Switch between different example categories
- ⌨️ **Simple Controls** - Easy navigation with j/k keys and arrow keys

## Quick Start

```bash
# Install dependencies
npm install -g cli-sandbox

# Run the sandbox
sandbox
```

## Creating Sandbox Files

Create files ending with `_sandbox.mjs` that export arrays of examples:

```javascript
export default [
  {
    name: "Basic Error",
    description: "Simple error example",
    value: "Error: Something went wrong",
  },

  {
    name: "Complex Error",
    description: "Error with context and suggestions",
    value: `Parse Error in config.json
  Expected ":" after property name
💡 Check line 3, column 12`,
  },
];
```

## Navigation

- **j/↓** - Move down
- **k/↑** - Move up
- **Enter** - Select item
- **-** - Go back
- **q** - Quit

## Usage

```bash
# Run with file watching
sandbox --watch

# Run with custom pattern
sandbox "**/*_test.mjs"
```
