import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import vitest from 'eslint-plugin-vitest';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    ...reactPlugin.configs.flat.recommended,
    plugins: {
      ...reactPlugin.configs.flat.recommended.plugins,
      'react-hooks': reactHooks
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      ...reactHooks.configs.recommended.rules
    }
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    plugins: { vitest },
    rules: {
      'vitest/expect-expect': 'off'
    }
  },
  eslintConfigPrettier
);
