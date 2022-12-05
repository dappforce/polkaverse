/* eslint-disable @typescript-eslint/no-var-requires */
const base = require('@subsocial/config/eslintrc')

// add override for any (a metric ton of them, initial conversion)
base.extends.push('prettier')
module.exports = {
  ...base,
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    semi: ['warn', 'never'],
    'react/prop-types': 'off',
    quotes: ['warn', 'single', { avoidEscape: true }],
    'no-multi-spaces': 'error',
    'non-nullish value': 'off',
    'react/display-name': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'off', // Checks effect dependencies
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-unnecessary-type-constraint': 'off',
    '@typescript-eslint/member-delimiter-style': ['warn', { multiline: { delimiter: 'none' } }],
    'prefer-const': 'off',
    'jsx-quotes': ['warn', 'prefer-single'],
    'object-curly-spacing': ['warn', 'always'],
  },
}
