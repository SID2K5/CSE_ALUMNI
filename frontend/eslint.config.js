import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: { react },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // Without this, ESLint cannot see identifiers used in JSX, so
      // `motion` (used as <motion.div>) and component props destructured
      // as `icon: Icon` (used as <Icon />) were reported as unused.
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'error',

      'no-unused-vars': [
        'error',
        {
          // Components / constructors referenced only in JSX
          varsIgnorePattern: '^[A-Z_]',
          // Destructured component props such as `icon: Icon`
          argsIgnorePattern: '^[A-Z_]',
          // `catch (err) {}` where the error is deliberately swallowed
          caughtErrorsIgnorePattern: '^(err|error|e|_)$',
        },
      ],
    },
  },
])
