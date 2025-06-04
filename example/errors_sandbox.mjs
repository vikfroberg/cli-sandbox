import {
  createError,
  createWarning,
  createValidationError,
  createCodeContext,
  createStackTrace,
  colors,
  icons,
} from "./sandbox-utils.js";

export default [
  {
    name: "Basic Error",
    description: "Simple error with red text",
    render() {
      createError("Something went wrong");
    },
  },

  {
    name: "Multi-line Error",
    description: "Error with stack trace styling",
    render() {
      createStackTrace("Failed to parse configuration", [
        "parseConfig (src/config.js:42:15)",
        "loadConfig (src/config.js:18:20)",
        "main (src/index.js:8:5)",
      ]);
    },
  },

  {
    name: "Formatted Error with Context",
    description: "Error with file context and line numbers",
    render() {
      createError("Parse Error in config.json");
      console.error();
      createCodeContext(
        [
          "{",
          '  "name": "my-project",',
          '  "version" "1.0.0"',
          '  "dependencies": {',
        ],
        3,
      );
      console.error();
      console.error(colors.error('Expected ":" after property name in JSON'));
    },
  },

  {
    name: "Warning with Icon",
    description: "Warning message with visual indicators",
    render() {
      createWarning("Deprecated API usage detected", [
        "Function fetchData() is deprecated",
        "Use fetchDataAsync() instead",
      ]);
      console.error();
      console.error(
        colors.info(
          `${icons.info} Learn more: https://docs.example.com/migration`,
        ),
      );
    },
  },

  {
    name: "Validation Error List",
    description: "Multiple validation errors in a list",
    render() {
      createValidationError("Validation failed with 3 errors:", [
        "Email is required",
        "Password must be at least 8 characters",
        "Username contains invalid characters",
      ]);
    },
  },
  {
    name: "Validation Error with Context",
    description: "Validation error with file context and line numbers",
    render() {
      createValidationError("Validation failed with 1 error:", [
        "Email is required",
      ]);
      console.error();
      createCodeContext(
        [
          "{",
          '  "name": "my-project",',
          '  "version" "1.0.0"',
          '  "dependencies": {',
        ],
        3,
      );
      console.error();
      console.error(colors.error('Expected ":" after property name in JSON'));
    },
  },
  {
    name: "Validation Error with Icon",
    description: "Validation error with visual indicators",
    render() {
      createValidationError("Validation failed with 1 error:", [
        "Email is required",
      ]);
      console.error();
      console.error(
        colors.info(
          `${icons.info} Learn more: https://docs.example.com/migration`,
        ),
      );
    },
  },
  {
    name: "Validation Error with Stack Trace",
    description: "Validation error with stack trace styling",
    render() {
      createValidationError("Validation failed with 1 error:", [
        "Email is required",
      ]);
      console.error();
      createStackTrace("Failed to parse configuration", [
        "parseConfig (src/config.js:42:15)",
        "loadConfig (src/config.js:18:20)",
        "main (src/index.js:8:5)",
      ]);
    },
  },

  {
    name: "Network Connection Error",
    description: "Connection timeout with retry suggestion",
    render() {
      createError("Network Error: Connection timeout");
    },
  },

  {
    name: "File Not Found Error", 
    description: "Missing file with helpful suggestions",
    render() {
      createError("ENOENT: no such file or directory");
    },
  },

  {
    name: "Permission Denied Error",
    description: "Access denied with fix instructions", 
    render() {
      createError("EACCES: permission denied");
    },
  },

  {
    name: "Database Connection Error",
    description: "Database connectivity issue",
    render() {
      createError("Database Error: Connection refused");
    },
  },

  {
    name: "Memory Limit Exceeded",
    description: "Out of memory error",
    render() {
      createError("JavaScript heap out of memory");
    },
  },

  {
    name: "API Rate Limit Error",
    description: "Rate limiting with retry information",
    render() {
      createError("HTTP 429: Too Many Requests");
    },
  },

  {
    name: "Compilation Error",
    description: "TypeScript compilation error",
    render() {
      createError("TypeScript Error: TS2345");
    },
  },

  {
    name: "Syntax Error",
    description: "JavaScript syntax error",
    render() {
      createError("SyntaxError: Unexpected token ')'");
    },
  },

  {
    name: "Environment Variable Missing",
    description: "Missing required environment variable",
    render() {
      createError("Missing required environment variable: DATABASE_URL");
    },
  },

  {
    name: "Package Not Found",
    description: "NPM package installation error",
    render() {
      createError("Module not found: Cannot resolve 'unknown-package'");
    },
  },

  {
    name: "CORS Error",
    description: "Cross-origin request blocked",
    render() {
      createError("CORS Error: Access blocked by CORS policy");
    },
  },

  {
    name: "Authentication Failed",
    description: "Invalid credentials",
    render() {
      createError("Authentication Error: Invalid username or password");
    },
  },
];
