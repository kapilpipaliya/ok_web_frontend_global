import * as monaco from 'monaco-editor';

/**
 * Extends the Monaco CSS language configuration to support interpolated variables
 * with syntax like ${args.theme.var.color.base_4}
 */
export function configureCssLanguageExtensions() {
  // Register a custom CSS language with extended tokenizer
  monaco.languages.register({ id: 'customCss' });

  // Define the token rules for our custom CSS language
  monaco.languages.setMonarchTokensProvider('customCss', {
    // Clone the original CSS tokenizer rules by creating a basic CSS-like tokenizer
    tokenizer: {
      root: [
        // Add custom rule for variable interpolation
        [/\${[^}]*}/, 'variable.interpolation'],
        // Standard CSS rules (simplified version)
        [/[^{]+{\s*/, 'delimiter.curly'],
        [/}/, 'delimiter.curly'],
        [/[-_a-zA-Z]+\s*:/, 'attribute.name'],
        [/:[^;]+;/, 'attribute.value'],
      ],
    },
  });

  // Override CSS validator to accept ${...} syntax in property values
  monaco.languages.css.cssDefaults.setOptions({
    validate: false,
    lint: {
      // Disable specific validations that would error on variable syntax
      unknownProperties: 'ignore',
      ieHack: 'ignore',
      unknownVendorSpecificProperties: 'ignore',
      emptyRules: 'ignore',
      universalSelector: 'ignore',
      zeroUnits: 'ignore',
    }
  });
} 