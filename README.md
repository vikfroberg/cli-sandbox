# CLI Sandbox

A terminal application for visually testing CLIs.

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

# Advanced usage

```bash
# Run with file watching
sandbox --watch

# Run with custom pattern
sandbox "**/*_test.mjs"
```
