import { 
  createHttpError, 
  createNetworkError,
  colors,
  icons 
} from "./sandbox-utils.js";

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
