import vitest from '@vitest/eslint-plugin'
import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import globals from 'globals'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default [
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: 'module',
      ecmaVersion: 14,
    },
    rules: {
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
    },
  },
  {
    files: ['test/**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
]
