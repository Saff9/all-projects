import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        getLinkIcon: 'readonly',
        user: 'readonly',
        generateProfileStructuredData: 'readonly',
      },
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Disable React in scope rule for React 17+ JSX transform
      'react/react-in-jsx-scope': 'off',
      // Relax rules to reduce lint noise for existing codebase
      'react/prop-types': 'off',
      'no-unused-vars': 'off',
      'react/no-unescaped-entities': 'off',
      'no-useless-catch': 'off',
      'no-case-declarations': 'off',
      'no-useless-escape': 'off',
      'no-undef': 'off',
    },
  },
];
