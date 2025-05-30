import chalk from "chalk";

export const icons = {
  error: "✖",
  warning: "⚠",
  info: "ℹ",
  success: "✓",
  suggestion: "💡",
  time: "⏱",
};

export const colors = {
  error: chalk.red,
  errorBold: chalk.red.bold,
  warning: chalk.yellow,
  info: chalk.blue,
  success: chalk.green,
  muted: chalk.gray,
  highlight: chalk.cyan,
  white: chalk.white,
};

export function createError(title, details = []) {
  console.error(colors.errorBold(`${icons.error} ${title}`));
  if (details.length > 0) {
    console.error();
    details.forEach((detail) => {
      if (typeof detail === "string") {
        console.error(colors.muted(`  ${detail}`));
      } else if (detail.type === "code") {
        console.error(colors.highlight(`  ${detail.content}`));
      } else if (detail.type === "suggestion") {
        console.error(colors.info(`${icons.suggestion} ${detail.content}`));
      }
    });
  }
}

export function createWarning(title, details = []) {
  console.error(colors.warning(`${icons.warning} ${title}`));
  if (details.length > 0) {
    console.error();
    details.forEach((detail) => {
      console.error(colors.muted(`  ${detail}`));
    });
  }
}

export function createValidationError(title, errors = [], suggestions = []) {
  console.error(colors.errorBold(title));
  console.error();

  if (errors.length > 0) {
    errors.forEach((error) => {
      if (typeof error === "object") {
        console.error(
          colors.error(`  ${error.field}`),
          colors.muted("→"),
          colors.error(error.message),
        );
      } else {
        console.error(colors.error(`• ${error}`));
      }
    });
  }

  if (suggestions.length > 0) {
    console.error();
    console.error(colors.info(`${icons.suggestion} Example valid values:`));
    suggestions.forEach((suggestion) => {
      console.error(colors.success(`  ${suggestion}`));
    });
  }
}

export function createCodeContext(lines, errorLine) {
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const prefix = `  ${lineNum} | `;

    if (lineNum === errorLine) {
      console.error(colors.error(`${prefix}${line}`));
      if (line.includes("^")) {
        console.error(colors.error(`    |${" ".repeat(line.indexOf("^"))}^`));
      }
    } else {
      console.error(colors.muted(`${prefix}${line}`));
    }
  });
}

export function createHttpError(
  method,
  url,
  status,
  statusText,
  response = null,
) {
  console.error(colors.errorBold(`HTTP ${status} ${statusText}`));
  console.error();
  console.error(colors.muted("Request:"));
  console.error(colors.info(`  ${method} ${url}`));

  if (response) {
    console.error(colors.muted("Response:"));
    console.error(colors.error(`  ${response}`));
  }
}

export function createNetworkError(type, details = {}) {
  const { host, timeout, message } = details;

  switch (type) {
    case "timeout":
      console.error(colors.error(`${icons.error} Connection timeout`));
      if (host) console.error(colors.muted(`  Failed to connect to ${host}`));
      if (timeout)
        console.error(colors.muted(`  Timeout after ${timeout} seconds`));
      break;

    case "dns":
      console.error(colors.error(`${icons.error} DNS lookup failed`));
      if (host)
        console.error(colors.muted(`  Could not resolve hostname: ${host}`));
      break;

    case "rate-limit":
      console.error(colors.warning(`${icons.time} Rate limit exceeded`));
      if (details.limit)
        console.error(colors.muted(`  API limit: ${details.limit}`));
      if (details.used) console.error(colors.muted(`  Used: ${details.used}`));
      if (details.resets)
        console.error(colors.muted(`  Resets: ${details.resets}`));
      break;

    default:
      console.error(
        colors.error(`${icons.error} ${message || "Network error"}`),
      );
  }
}

export function createStackTrace(error, frames = []) {
  console.error(colors.errorBold(`Error: ${error}`));
  frames.forEach((frame) => {
    console.error(colors.muted(`  at ${frame}`));
  });
}
