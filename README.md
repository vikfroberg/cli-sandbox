# CLI Playground

A visual CLI error testing playground for developers. Test your error messages, colors, formatting, and layout in real-time.

## Features

- 🎮 **Interactive CLI** - Visual playground for testing error messages
- 🔄 **Live Reload** - Automatically updates when you edit sandbox files
- 🔍 **Fuzzy Search** - Focus on specific examples with `/focus`
- 📁 **Multiple Sandboxes** - Switch between different error categories
- ⌨️ **Slash Commands** - Powerful command interface

## Quick Start

```bash
# Install dependencies
npm install

# Run the playground
npm start

# Or run directly
node src/index.js
```

## Creating Sandbox Files

Create files ending with `_sandbox.mjs` that export arrays of test cases:

```javascript
import chalk from "chalk";

export default [
  {
    name: "Basic Error",
    description: "Simple error with red text",
    render() {
      console.error(chalk.red("Error: Something went wrong"));
    },
  },

  {
    name: "Complex Error",
    description: "Error with context and suggestions",
    render() {
      console.error(chalk.red.bold("Parse Error in config.json"));
      console.error(chalk.gray('  Expected ":" after property name'));
      console.error(chalk.blue("💡 Check line 3, column 12"));
    },
  },
];
```

## Available Commands

- `/help` - Show available commands
- `/focus [query]` - Focus on specific examples (fuzzy search)
- `/sandboxes` - List all sandbox files
- `/switch <file>` - Switch to a different sandbox
- `/clear` - Clear screen and re-render
- `/exit` - Exit playground

## Example Usage

```bash
# Use default pattern (*_sandbox.mjs)
playground

# Custom pattern
playground "**/*_test.mjs"

# Focus on validation errors
# (inside CLI) /focus validation

# Switch to network errors
# (inside CLI) /switch network
```

## Example Files Included

- `errors_sandbox.mjs` - General error examples
- `network_sandbox.mjs` - Network-related errors
- `validation_sandbox.mjs` - Form and data validation errors

## Tips

- Use chalk for colors and formatting
- Each example can have a `name` and `description`
- The `render()` function is where you output your error
- Files are watched for changes - edit and see updates instantly
- Use `/focus` to isolate specific examples while developing

