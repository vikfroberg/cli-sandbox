import chalk from "chalk";

const icons = {
  error: "✖",
  warning: "⚠",
  info: "ℹ",
  success: "✓",
  suggestion: "💡",
  time: "⏱",
};

const colors = {
  error: chalk.red,
  errorBold: chalk.red.bold,
  warning: chalk.yellow,
  info: chalk.blue,
  success: chalk.green,
  muted: chalk.gray,
  highlight: chalk.cyan,
  white: chalk.white,
};

function createError(title, details = []) {
  let output = colors.errorBold(`${icons.error} ${title}`);
  if (details.length > 0) {
    output += '\n\n';
    details.forEach((detail) => {
      if (typeof detail === "string") {
        output += colors.muted(`  ${detail}`) + '\n';
      } else if (detail.type === "code") {
        output += colors.highlight(`  ${detail.content}`) + '\n';
      } else if (detail.type === "suggestion") {
        output += colors.info(`${icons.suggestion} ${detail.content}`) + '\n';
      }
    });
  }
  return output;
}

function createValidationError(title, errors = [], suggestions = []) {
  let output = colors.errorBold(title) + '\n\n';

  if (errors.length > 0) {
    errors.forEach((error) => {
      if (typeof error === "object") {
        output += colors.error(`  ${error.field}`) + ' ' + colors.muted("→") + ' ' + colors.error(error.message) + '\n';
      } else {
        output += colors.error(`• ${error}`) + '\n';
      }
    });
  }

  if (suggestions.length > 0) {
    output += '\n';
    output += colors.info(`${icons.suggestion} Example valid values:`) + '\n';
    suggestions.forEach((suggestion) => {
      output += colors.success(`  ${suggestion}`) + '\n';
    });
  }
  return output;
}

export default [
  {
    name: "Form Validation",
    description: "Detailed form validation with field highlighting",
    value: createValidationError(
      "Form validation failed",
      [
        { field: "email", message: "Invalid email format" },
        {
          field: "password",
          message: "Must contain at least one uppercase letter",
        },
        { field: "age", message: "Must be between 18 and 120" },
      ],
      ["email: user@example.com", "password: MySecureP@ss123", "age: 25"],
    ),
  },

  {
    name: "Schema Validation",
    description: "JSON schema validation with path highlighting",
    value: (() => {
      let output = colors.error("Schema validation failed:") + '\n\n';
      output += colors.error("  data.user.profile.avatar") + '\n';
      output += colors.muted("    Expected: string (URL)") + '\n';
      output += colors.muted("    Received: number (123)") + '\n\n';
      output += colors.error("  data.settings.theme") + '\n';
      output += colors.muted('    Expected: "light" | "dark"') + '\n';
      output += colors.muted('    Received: "blue"');
      return output;
    })(),
  },

  {
    name: "File Upload Validation",
    description: "File validation with size and type constraints",
    value: (() => {
      let output = createError("File upload rejected");
      output += '\n\n';
      output += colors.muted("File:") + ' ' + colors.white("document.pdf") + '\n';
      output += colors.error("• File too large: 15.2MB (max: 10MB)") + '\n';
      output += colors.error("• Invalid type: PDF (allowed: JPG, PNG, GIF)") + '\n\n';
      output += colors.info(`${icons.success} Suggestions:`) + '\n';
      output += colors.muted("  • Compress the file or use a different format") + '\n';
      output += colors.muted("  • Convert PDF to image if it contains a single page");
      return output;
    })(),
  },
];

