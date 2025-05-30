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
];

