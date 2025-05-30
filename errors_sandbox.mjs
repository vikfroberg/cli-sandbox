import chalk from 'chalk';

export default [
  {
    name: "Basic Error",
    description: "Simple error with red text",
    render() {
      console.error(chalk.red('Error: Something went wrong'));
    }
  },
  
  {
    name: "Multi-line Error",
    description: "Error with stack trace styling",
    render() {
      console.error(chalk.red.bold('Error: Failed to parse configuration'));
      console.error(chalk.gray('  at parseConfig (src/config.js:42:15)'));
      console.error(chalk.gray('  at loadConfig (src/config.js:18:20)'));
      console.error(chalk.gray('  at main (src/index.js:8:5)'));
    }
  },
  
  {
    name: "Formatted Error with Context",
    description: "Error with file context and line numbers",
    render() {
      console.error(chalk.red('✖ Parse Error in config.json'));
      console.error();
      console.error(chalk.gray('  1 | {'));
      console.error(chalk.gray('  2 |   "name": "my-project",'));
      console.error(chalk.red('  3 |   "version" "1.0.0"'));
      console.error(chalk.red('    |            ^'));
      console.error(chalk.gray('  4 |   "dependencies": {'));
      console.error();
      console.error(chalk.red('Expected ":" after property name in JSON'));
    }
  },
  
  {
    name: "Warning with Icon",
    description: "Warning message with visual indicators",
    render() {
      console.error(chalk.yellow('⚠ Warning: Deprecated API usage detected'));
      console.error(chalk.gray('  Function fetchData() is deprecated'));
      console.error(chalk.gray('  Use fetchDataAsync() instead'));
      console.error();
      console.error(chalk.blue('ℹ Learn more: https://docs.example.com/migration'));
    }
  },
  
  {
    name: "Validation Error List",
    description: "Multiple validation errors in a list",
    render() {
      console.error(chalk.red.bold('Validation failed with 3 errors:'));
      console.error();
      console.error(chalk.red('• Email is required'));
      console.error(chalk.red('• Password must be at least 8 characters'));
      console.error(chalk.red('• Username contains invalid characters'));
    }
  }
];