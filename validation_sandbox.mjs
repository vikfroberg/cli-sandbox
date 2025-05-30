import chalk from 'chalk';

export default [
  {
    name: "Form Validation",
    description: "Detailed form validation with field highlighting",
    render() {
      console.error(chalk.red.bold('Form validation failed'));
      console.error();
      console.error(chalk.gray('Field errors:'));
      console.error(chalk.red('  email'), chalk.gray('→'), chalk.red('Invalid email format'));
      console.error(chalk.red('  password'), chalk.gray('→'), chalk.red('Must contain at least one uppercase letter'));
      console.error(chalk.red('  age'), chalk.gray('→'), chalk.red('Must be between 18 and 120'));
      console.error();
      console.error(chalk.blue('💡 Example valid values:'));
      console.error(chalk.green('  email: user@example.com'));
      console.error(chalk.green('  password: MySecureP@ss123'));
      console.error(chalk.green('  age: 25'));
    }
  },
  
  {
    name: "Schema Validation",
    description: "JSON schema validation with path highlighting",
    render() {
      console.error(chalk.red('Schema validation failed:'));
      console.error();
      console.error(chalk.red('  data.user.profile.avatar'));
      console.error(chalk.gray('    Expected: string (URL)'));
      console.error(chalk.gray('    Received: number (123)'));
      console.error();
      console.error(chalk.red('  data.settings.theme'));
      console.error(chalk.gray('    Expected: "light" | "dark"'));
      console.error(chalk.gray('    Received: "blue"'));
    }
  },
  
  {
    name: "File Upload Validation",
    description: "File validation with size and type constraints",
    render() {
      console.error(chalk.red('✖ File upload rejected'));
      console.error();
      console.error(chalk.gray('File:'), chalk.white('document.pdf'));
      console.error(chalk.red('• File too large: 15.2MB (max: 10MB)'));
      console.error(chalk.red('• Invalid type: PDF (allowed: JPG, PNG, GIF)'));
      console.error();
      console.error(chalk.blue('✓ Suggestions:'));
      console.error(chalk.gray('  • Compress the file or use a different format'));
      console.error(chalk.gray('  • Convert PDF to image if it contains a single page'));
    }
  }
];