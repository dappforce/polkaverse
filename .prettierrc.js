const base = require('@subsocial/config/prettierrc')

// add override for any (a metric ton of them, initial conversion)
module.exports = {
  ...base,
  jsxSingleQuote: true,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
}
