import pluginJs from "@eslint/js";
import masterCssPlugin from '@master/eslint-plugin-css';
import perfectionistNatural from 'eslint-plugin-perfectionist/configs/recommended-natural';
import globals from "globals";
import tseslint from "typescript-eslint";

// get help from https://github.com/Suyashtnt/personal-website/blob/master/eslint.config.js
export default [
    {
        ignores: ['.output/**/*', '.vinxi/**/*', 'node_modules/**/*', 'src/components/master_ui/core/**/*']
    },
    {files: ["**/*.{js,mjs,cjs,ts}"]},
    {languageOptions: { globals: {...globals.browser, ...globals.node} }},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        plugins: masterCssPlugin.configs.flat.plugins,
        rules: masterCssPlugin.configs.flat.rules
    },
    {
        files: ['**/*.js', '**/*.cjs']
    },
    perfectionistNatural,
  
];