# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CLI Playground is a simple React/Ink-based application for testing CLI interfaces and components. The current implementation is a basic "Hello, world!" app built with React and Ink for terminal rendering.

## Key Commands

```bash
# Run the application
npm start
# or
node src/index.js

# Development with file watching
npm run dev
# or
node --watch src/index.js
```

## Architecture

### Current Structure

- **src/index.js** - Main application entry point with React/Ink setup
- **src/help.js** - Help text and usage information (references missing shared.js)
- **example/** - Contains sandbox files for testing CLI error patterns

### Dependencies

- **React + Ink** - Terminal UI framework
- **Clear** - Terminal clearing utility
- **Chalk** - Terminal color styling (used in sandbox utilities)
- **Chokidar** - File watching capabilities
- **Fuse.js** - Fuzzy search functionality
- **Glob** - File pattern matching

### Sandbox System

The `example/` directory contains sandbox files demonstrating CLI error patterns:

- **sandbox-utils.js** - Utility functions for creating styled error messages, warnings, and other CLI output patterns
- **errors_sandbox.mjs** - General error examples
- **network_sandbox.mjs** - Network-related errors  
- **validation_sandbox.mjs** - Form and data validation errors

The sandbox utilities provide helpers for:
- Creating styled error messages with icons and colors
- HTTP error formatting
- Network error patterns (timeout, DNS, rate-limiting)
- Validation error display
- Code context highlighting
- Stack trace formatting

### Current State

The application appears to be in early development, with a basic React/Ink setup and utility files for CLI error pattern testing. The main application currently only renders "Hello, world!".

## Development Notes

- Uses ES modules (`"type": "module"` in package.json)
- No build step required - runs directly with Node.js
- Help system references missing `shared.js` file
- Includes CLI binary setup for global installation
- Project dependencies include file watching, fuzzy search, and pattern matching capabilities