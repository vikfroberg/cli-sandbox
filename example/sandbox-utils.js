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
  let output = colors.errorBold(`${icons.error} ${title}`);
  if (details.length > 0) {
    output += "\n\n";
    details.forEach((detail) => {
      if (typeof detail === "string") {
        output += colors.muted(`  ${detail}`) + "\n";
      } else if (detail.type === "code") {
        output += colors.highlight(`  ${detail.content}`) + "\n";
      } else if (detail.type === "suggestion") {
        output += colors.info(`${icons.suggestion} ${detail.content}`) + "\n";
      }
    });
  }
  return output;
}

export function createWarning(title, details = []) {
  let output = colors.warning(`${icons.warning} ${title}`);
  if (details.length > 0) {
    output += "\n\n";
    details.forEach((detail) => {
      output += colors.muted(`  ${detail}`) + "\n";
    });
  }
  return output;
}

export function createValidationError(title, errors = [], suggestions = []) {
  let output = colors.errorBold(title) + "\n\n";

  if (errors.length > 0) {
    errors.forEach((error) => {
      if (typeof error === "object") {
        output +=
          colors.error(`  ${error.field}`) +
          " " +
          colors.muted("→") +
          " " +
          colors.error(error.message) +
          "\n";
      } else {
        output += colors.error(`• ${error}`) + "\n";
      }
    });
  }

  if (suggestions.length > 0) {
    output += "\n";
    output += colors.info(`${icons.suggestion} Example valid values:`) + "\n";
    suggestions.forEach((suggestion) => {
      output += colors.success(`  ${suggestion}`) + "\n";
    });
  }
  return output;
}

export function createCodeContext(lines, errorLine) {
  let output = "";
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const prefix = `  ${lineNum} | `;

    if (lineNum === errorLine) {
      output += colors.error(`${prefix}${line}`) + "\n";
      if (line.includes("^")) {
        output += colors.error(`    |${" ".repeat(line.indexOf("^"))}^`) + "\n";
      }
    } else {
      output += colors.muted(`${prefix}${line}`) + "\n";
    }
  });
  return output;
}

export function createStackTrace(error, frames = []) {
  let output = colors.errorBold(`Error: ${error}`) + "\n";
  frames.forEach((frame) => {
    output += colors.muted(`  at ${frame}`) + "\n";
  });
  return output;
}

export function createHttpError(
  method,
  url,
  status,
  statusText,
  response = null,
) {
  let output = colors.errorBold(`HTTP ${status} ${statusText}`) + "\n\n";
  output += colors.muted("Request:") + "\n";
  output += colors.info(`  ${method} ${url}`) + "\n";

  if (response) {
    output += colors.muted("Response:") + "\n";
    output += colors.error(`  ${response}`) + "\n";
  }
  return output;
}

export function createNetworkError(type, details = {}) {
  const { host, timeout, message } = details;
  let output = "";

  switch (type) {
    case "timeout":
      output += colors.error(`${icons.error} Connection timeout`) + "\n";
      if (host) output += colors.muted(`  Failed to connect to ${host}`) + "\n";
      if (timeout)
        output += colors.muted(`  Timeout after ${timeout} seconds`) + "\n";
      break;

    case "dns":
      output += colors.error(`${icons.error} DNS lookup failed`) + "\n";
      if (host)
        output += colors.muted(`  Could not resolve hostname: ${host}`) + "\n";
      break;

    case "rate-limit":
      output += colors.warning(`${icons.time} Rate limit exceeded`) + "\n";
      if (details.limit)
        output += colors.muted(`  API limit: ${details.limit}`) + "\n";
      if (details.used)
        output += colors.muted(`  Used: ${details.used}`) + "\n";
      if (details.resets)
        output += colors.muted(`  Resets: ${details.resets}`) + "\n";
      break;

    default:
      output +=
        colors.error(`${icons.error} ${message || "Network error"}`) + "\n";
  }
  return output;
}
