import chalk from 'chalk';
import { createNetworkError, createHttpError, colors, icons } from './src/sandbox-utils.js';

export default [
  {
    name: "Connection Timeout",
    description: "Network timeout error with retry suggestion",
    render() {
      createNetworkError('timeout', {
        host: 'api.example.com:443',
        timeout: 30
      });
      console.error();
      console.error(colors.info(`${icons.suggestion} Try again with:`), colors.highlight('--timeout 60'));
    }
  },
  
  {
    name: "HTTP Error",
    description: "HTTP status error with detailed response",
    render() {
      createHttpError(
        'GET',
        '/api/users/invalid-id',
        404,
        'Not Found',
        '{"error": "User not found", "code": "USER_NOT_FOUND"}'
      );
    }
  },
  
  {
    name: "DNS Resolution Failure",
    description: "DNS lookup failure with troubleshooting tips",
    render() {
      createNetworkError('dns', {
        host: 'invalid-domain.example'
      });
      console.error();
      console.error(colors.warning('Troubleshooting steps:'));
      console.error(colors.muted('  1. Check your internet connection'));
      console.error(colors.muted('  2. Verify the domain name is correct'));
      console.error(colors.muted('  3. Try using a different DNS server'));
    }
  },
  
  {
    name: "Rate Limited",
    description: "API rate limiting error with next retry time",
    render() {
      createNetworkError('rate-limit', {
        limit: '100 requests per hour',
        used: '100/100',
        resets: '2024-01-01 15:30:00 UTC'
      });
      console.error();
      console.error(colors.info(`${icons.info} Consider upgrading to Pro for higher limits`));
    }
  }
];