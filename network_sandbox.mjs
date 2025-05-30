import chalk from 'chalk';

export default [
  {
    name: "Connection Timeout",
    description: "Network timeout error with retry suggestion",
    render() {
      console.error(chalk.red('✖ Connection timeout'));
      console.error(chalk.gray('  Failed to connect to api.example.com:443'));
      console.error(chalk.gray('  Timeout after 30 seconds'));
      console.error();
      console.error(chalk.blue('💡 Try again with:'), chalk.cyan('--timeout 60'));
    }
  },
  
  {
    name: "HTTP Error",
    description: "HTTP status error with detailed response",
    render() {
      console.error(chalk.red.bold('HTTP 404 Not Found'));
      console.error();
      console.error(chalk.gray('Request:'));
      console.error(chalk.blue('  GET /api/users/invalid-id'));
      console.error(chalk.gray('Response:'));
      console.error(chalk.red('  {"error": "User not found", "code": "USER_NOT_FOUND"}'));
    }
  },
  
  {
    name: "DNS Resolution Failure",
    description: "DNS lookup failure with troubleshooting tips",
    render() {
      console.error(chalk.red('✖ DNS lookup failed'));
      console.error(chalk.gray('  Could not resolve hostname: invalid-domain.example'));
      console.error();
      console.error(chalk.yellow('Troubleshooting steps:'));
      console.error(chalk.gray('  1. Check your internet connection'));
      console.error(chalk.gray('  2. Verify the domain name is correct'));
      console.error(chalk.gray('  3. Try using a different DNS server'));
    }
  },
  
  {
    name: "Rate Limited",
    description: "API rate limiting error with next retry time",
    render() {
      console.error(chalk.yellow('⏱ Rate limit exceeded'));
      console.error(chalk.gray('  API limit: 100 requests per hour'));
      console.error(chalk.gray('  Used: 100/100'));
      console.error(chalk.gray('  Resets: 2024-01-01 15:30:00 UTC'));
      console.error();
      console.error(chalk.blue('ℹ Consider upgrading to Pro for higher limits'));
    }
  }
];