import chalk from 'chalk';
import { createValidationError, createError, colors, icons } from './src/sandbox-utils.js';

export default [
  {
    name: "Form Validation",
    description: "Detailed form validation with field highlighting",
    render() {
      createValidationError('Form validation failed', [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Must contain at least one uppercase letter' },
        { field: 'age', message: 'Must be between 18 and 120' }
      ], [
        'email: user@example.com',
        'password: MySecureP@ss123',
        'age: 25'
      ]);
    }
  },
  
  {
    name: "Schema Validation",
    description: "JSON schema validation with path highlighting",
    render() {
      console.error(colors.error('Schema validation failed:'));
      console.error();
      console.error(colors.error('  data.user.profile.avatar'));
      console.error(colors.muted('    Expected: string (URL)'));
      console.error(colors.muted('    Received: number (123)'));
      console.error();
      console.error(colors.error('  data.settings.theme'));
      console.error(colors.muted('    Expected: "light" | "dark"'));
      console.error(colors.muted('    Received: "blue"'));
    }
  },
  
  {
    name: "File Upload Validation",
    description: "File validation with size and type constraints",
    render() {
      createError('File upload rejected');
      console.error();
      console.error(colors.muted('File:'), colors.white('document.pdf'));
      console.error(colors.error('• File too large: 15.2MB (max: 10MB)'));
      console.error(colors.error('• Invalid type: PDF (allowed: JPG, PNG, GIF)'));
      console.error();
      console.error(colors.info(`${icons.success} Suggestions:`));
      console.error(colors.muted('  • Compress the file or use a different format'));
      console.error(colors.muted('  • Convert PDF to image if it contains a single page'));
    }
  }
];