import { 
  createError, 
  createWarning, 
  createValidationError, 
  createCodeContext, 
  createStackTrace,
  colors,
  icons 
} from "./sandbox-utils.js";

export default [
  {
    name: "Basic Error",
    description: "Simple error with red text",
    value: createError("Something went wrong"),
  },

  {
    name: "Multi-line Error",
    description: "Error with stack trace styling",
    value: createStackTrace("Failed to parse configuration", [
      "parseConfig (src/config.js:42:15)",
      "loadConfig (src/config.js:18:20)",
      "main (src/index.js:8:5)",
    ]),
  },

  {
    name: "Formatted Error with Context",
    description: "Error with file context and line numbers",
    value: (() => {
      let output = createError("Parse Error in config.json");
      output += "\n\n";
      output += createCodeContext(
        [
          "{",
          '  "name": "my-project",',
          '  "version" "1.0.0"',
          '  "dependencies": {',
        ],
        3,
      );
      output += "\n";
      output += colors.error('Expected ":" after property name in JSON');
      return output;
    })(),
  },

  {
    name: "Warning with Icon",
    description: "Warning message with visual indicators",
    value: (() => {
      let output = createWarning("Deprecated API usage detected", [
        "Function fetchData() is deprecated",
        "Use fetchDataAsync() instead",
      ]);
      output += "\n";
      output += colors.info(
        `${icons.info} Learn more: https://docs.example.com/migration`,
      );
      return output;
    })(),
  },

  {
    name: "Validation Error List",
    description: "Multiple validation errors in a list",
    value: createValidationError("Validation failed with 3 errors:", [
      "Email is required",
      "Password must be at least 8 characters",
      "Username contains invalid characters",
    ]),
  },
  {
    name: "Validation Error with Context",
    description: "Validation error with file context and line numbers",
    value: (() => {
      let output = createValidationError("Validation failed with 1 error:", [
        "Email is required",
      ]);
      output += "\n";
      output += createCodeContext(
        [
          "{",
          '  "name": "my-project",',
          '  "version" "1.0.0"',
          '  "dependencies": {',
        ],
        3,
      );
      output += "\n";
      output += colors.error('Expected ":" after property name in JSON');
      return output;
    })(),
  },
  {
    name: "Validation Error with Icon",
    description: "Validation error with visual indicators",
    value: (() => {
      let output = createValidationError("Validation failed with 1 error:", [
        "Email is required",
      ]);
      output += "\n";
      output += colors.info(
        `${icons.info} Learn more: https://docs.example.com/migration`,
      );
      return output;
    })(),
  },
  {
    name: "Validation Error with Stack Trace",
    description: "Validation error with stack trace styling",
    value: (() => {
      let output = createValidationError("Validation failed with 1 error:", [
        "Email is required",
      ]);
      output += "\n";
      output += createStackTrace("Failed to parse configuration", [
        "parseConfig (src/config.js:42:15)",
        "loadConfig (src/config.js:18:20)",
        "main (src/index.js:8:5)",
      ]);
      return output;
    })(),
  },

  {
    name: "Network Connection Error",
    description: "Connection timeout with retry suggestion",
    value: createError("Network Error: Connection timeout"),
  },

  {
    name: "File Not Found Error",
    description: "Missing file with helpful suggestions",
    value: createError("ENOENT: no such file or directory"),
  },

  {
    name: "Permission Denied Error",
    description: "Access denied with fix instructions",
    value: createError("EACCES: permission denied"),
  },

  {
    name: "Database Connection Error",
    description: "Database connectivity issue",
    value: createError("Database Error: Connection refused"),
  },

  {
    name: "Memory Limit Exceeded",
    description: "Out of memory error",
    value: createError("JavaScript heap out of memory"),
  },

  {
    name: "API Rate Limit Error",
    description: "Rate limiting with retry information",
    value: createError("HTTP 429: Too Many Requests"),
  },

  {
    name: "Compilation Error",
    description: "TypeScript compilation error",
    value: createError("TypeScript Error: TS2345"),
  },

  {
    name: "Syntax Error",
    description: "JavaScript syntax error",
    value: createError("SyntaxError: Unexpected token ')'"),
  },

  {
    name: "Environment Variable Missing",
    description: "Missing required environment variable",
    value: createError("Missing required environment variable: DATABASE_URL"),
  },

  {
    name: "Package Not Found",
    description: "NPM package installation error",
    value: createError("Module not found: Cannot resolve 'unknown-package'"),
  },

  {
    name: "CORS Error",
    description: "Cross-origin request blocked",
    value: createError("CORS Error: Access blocked by CORS policy"),
  },

  {
    name: "Authentication Failed",
    description: "Invalid credentials",
    value: createError("Authentication Error: Invalid username or password"),
  },
];
