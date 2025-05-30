# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CLI Playground is an interactive visual testing environment for CLI error messages and formatting. The application allows developers to test error messages, colors, and layouts in real-time with live reload capabilities.

## Key Commands

```bash
# Run the playground
npm start
# or
node src/index.js

# Development with file watching
npm run dev

# Run automated tests
node test.js
```

## Architecture

The application follows a modular architecture with clear separation of concerns:

### Core Components

- **CLIPlayground** (`src/index.js`) - Main application class that orchestrates the entire system
- **CommandHandler** (`src/command-handler.js`) - Processes slash commands like `/help`, `/focus`, `/switch`
- **Renderer** (`src/renderer.js`) - Handles all UI rendering, including welcome screen and example display
- **KeyboardHandler** (`src/keyboard-handler.js`) - Manages keyboard input and navigation

### Sandbox System

The playground discovers and loads sandbox files matching the pattern `*_sandbox.mjs`. Each sandbox file exports an array of test cases with this structure:

```javascript
export default [
  {
    name: "Example Name",
    description: "Example description", 
    render() {
      // Output your CLI content here
    }
  }
];
```

### Navigation States

The application has two main states:
1. **Welcome Screen** - Hierarchical file browser for selecting sandboxes
2. **Sandbox View** - Interactive example browser with focus mode capability

### File Watching

Uses `chokidar` to watch sandbox files for changes and automatically reload content. The watcher is set up when a sandbox is selected and torn down when returning to welcome screen.

### Key Features

- **Fuzzy Search** - Uses Fuse.js for `/focus` command to find examples by name or description
- **Live Reload** - Automatic reloading of sandbox files on change
- **Slash Commands** - Command interface for navigation and control
- **Focus Mode** - Isolate specific examples for development

## Utilities

- **sandbox-utils.js** - Helper functions for creating common error patterns and formatting
- **test-utils.js** - Automated testing framework for simulating user interactions
- **utils.js** - Terminal utilities (cursor control, screen clearing)
- **constants.js** - Application constants and help text

## Sandbox File Structure

Existing sandbox files demonstrate different error categories:
- `errors_sandbox.mjs` - General error examples
- `network_sandbox.mjs` - Network-related errors  
- `validation_sandbox.mjs` - Form and data validation errors