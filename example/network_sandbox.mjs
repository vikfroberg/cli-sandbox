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

function createHttpError(method, url, status, statusText, response = null) {
  let output = colors.errorBold(`HTTP ${status} ${statusText}`) + '\n\n';
  output += colors.muted("Request:") + '\n';
  output += colors.info(`  ${method} ${url}`) + '\n';

  if (response) {
    output += colors.muted("Response:") + '\n';
    output += colors.error(`  ${response}`) + '\n';
  }
  return output;
}

function createNetworkError(type, details = {}) {
  const { host, timeout, message } = details;
  let output = '';

  switch (type) {
    case "timeout":
      output += colors.error(`${icons.error} Connection timeout`) + '\n';
      if (host) output += colors.muted(`  Failed to connect to ${host}`) + '\n';
      if (timeout)
        output += colors.muted(`  Timeout after ${timeout} seconds`) + '\n';
      break;

    case "dns":
      output += colors.error(`${icons.error} DNS lookup failed`) + '\n';
      if (host)
        output += colors.muted(`  Could not resolve hostname: ${host}`) + '\n';
      break;

    case "rate-limit":
      output += colors.warning(`${icons.time} Rate limit exceeded`) + '\n';
      if (details.limit)
        output += colors.muted(`  API limit: ${details.limit}`) + '\n';
      if (details.used) output += colors.muted(`  Used: ${details.used}`) + '\n';
      if (details.resets)
        output += colors.muted(`  Resets: ${details.resets}`) + '\n';
      break;

    default:
      output += colors.error(`${icons.error} ${message || "Network error"}`) + '\n';
  }
  return output;
}

export default [
  {
    name: "Connection Timeout",
    description: "Network timeout error with retry suggestion",
    value: (() => {
      let output = createNetworkError("timeout", {
        host: "api.example.com:443",
        timeout: 30,
      });
      output += '\n';
      output += colors.info(`${icons.suggestion} Try again with:`) + ' ' + colors.highlight("--timeout 60");
      return output;
    })(),
  },

  {
    name: "HTTP Error",
    description: "HTTP status error with detailed response",
    value: createHttpError(
      "GET",
      "/api/users/invalid-id",
      404,
      "Not Found",
      '{"error": "User not found", "code": "USER_NOT_FOUND"}',
    ),
  },

  {
    name: "DNS Resolution Failure",
    description: "DNS lookup failure with troubleshooting tips",
    value: (() => {
      let output = createNetworkError("dns", {
        host: "invalid-domain.example",
      });
      output += '\n';
      output += colors.warning("Troubleshooting steps:") + '\n';
      output += colors.muted("  1. Check your internet connection") + '\n';
      output += colors.muted("  2. Verify the domain name is correct") + '\n';
      output += colors.muted("  3. Try using a different DNS server");
      return output;
    })(),
  },

  {
    name: "Rate Limited",
    description: "API rate limiting error with next retry time",
    value: (() => {
      let output = createNetworkError("rate-limit", {
        limit: "100 requests per hour",
        used: "100/100",
        resets: "2024-01-01 15:30:00 UTC",
      });
      output += '\n';
      output += colors.info(
        `${icons.info} Consider upgrading to Pro for higher limits`,
      );
      return output;
    })(),
  },
];
