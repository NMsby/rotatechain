import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from '@typescript-eslint/eslint-plugin'

export default [
  {
    ignores: ['dist', 'build', 'node_modules', '**/*.js', '**/*.cjs']
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { 
        ...globals.browser,
        ...globals.node,
        process: 'readonly',
        __dirname: 'readonly',
        NodeJS: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-refresh/only-export-components': 'off',
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
]