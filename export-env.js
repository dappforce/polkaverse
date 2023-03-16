/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { writeFileSync } = require('fs')

require('dotenv').config()

const varsToExport = [
  'NODE_ENV',
  'LOG_LEVEL',
  'APP_KIND',
  'APP_BASE_URL',
  'CONNECTION_KIND',

  'ENABLE_SEARCH',
  'ENABLE_FEED',
  'ENABLE_NOTIFICATIONS',
  'ENABLE_ACTIVITY',
  'ENABLE_SQUID_DATA_SOURCE',

  'ENABLE_SESSION_KEY',
  'ENABLE_EMAIL_SETTINGS',
  'ENABLE_FAUCET',
  'ENABLE_GRAPHQL',
  'ENABLE_DOWNVOTES',
  'ENABLE_CONTRIBUTION_PAGE',
  'ENABLE_ONCHAIN_ACTIVITIES',

  'ENABLE_MAINTENANCE_PAGE',
  'MAINTENANCE_TEXT',

  'GA_ID',

  'HCAPTCHA_SITE_KEY',

  'SUBSTRATE_URL',
  'SUBSTRATE_RPC_URL',
  'OFFCHAIN_URL',
  'OFFCHAIN_WS',
  'GRAPHQL_URL',
  'IPFS_NODE_URL',
  'OFFCHAIN_SIGNER_URL',
]

function getSerializedVal(varName) {
  const val = process.env[varName]
  return typeof val === 'string' ? `'${val}'` : val
}

const vals = varsToExport.map(varName => `${varName}: ${getSerializedVal(varName)}`).join(',\n  ')

const jsFile = `${__dirname}/public/env.js`

console.log(`Export .env to ${jsFile}`)

writeFileSync(
  jsFile,
  `// WARN: This is a generated file. Do not modify!

if (!window.process) window.process = {};
if (!window.process.ENV) window.process.ENV = {};

window.process.env = {
  ${vals}
};
`,
  'utf8',
)
