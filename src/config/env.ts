import { newLogger } from '@subsocial/utils'
import { AppConfig, AppKind, ConnectionKind, ConnectionsSettings, SubsocialFeatures } from './types'
export const nodeEnv = process.env['NEXT_PUBLIC_NODE_ENV']

newLogger.setDefaultLevel(process.env['NEXT_PUBLIC_LOG_INFO'] as any)

export const isProdMode = nodeEnv === 'production'
export const isDevMode = !isProdMode

export const appKind = (process.env['NEXT_PUBLIC_APP_KIND'] || 'polkaverse') as unknown as AppKind

export const connectionKind = (process.env['NEXT_PUBLIC_CONNECTION_KIND'] ||
  'main') as unknown as ConnectionKind

export const enableMaintenancePage = process.env['NEXT_PUBLIC_ENABLE_MAINTENANCE_PAGE'] as
  | boolean
  | undefined
export const maintenanceMsg = process.env['NEXT_PUBLIC_MAINTENANCE_TEXT']

export const gaId = process.env['NEXT_PUBLIC_GA_ID'] || ''

export const hCaptchaSiteKey = process.env['NEXT_PUBLIC_HCAPTCHA_SITE_KEY'] || ''

export const appOverrides: Partial<AppConfig> = {
  appBaseUrl: process.env['NEXT_PUBLIC_APP_BASE_URL'],
}

export const ampId = process.env['NEXT_PUBLIC_AMP_ID'] || ''

export const serverMnemonic = process.env['SERVER_MNEMONIC']
export const datahubQueueConfig = {
  url: process.env['DATAHUB_QUEUE_URL'],
  token: process.env['DATAHUB_QUEUE_TOKEN'],
}

export const datahubQueryUrl = process.env['NEXT_PUBLIC_DATAHUB_QUERY_URL']
export const datahubSubscriptionUrl = process.env['NEXT_PUBLIC_DATAHUB_SUBSCRIPTION_URL']

/**
 * Enable or disable the available features of this web app by overriding them in the .env file.
 */
export const featureOverrides: SubsocialFeatures = {
  enableSearch: process.env['NEXT_PUBLIC_ENABLE_SEARCH'] as boolean | undefined,
  enableFeed: process.env['NEXT_PUBLIC_ENABLE_FEED'] as boolean | undefined,
  enableNotifications: process.env['NEXT_PUBLIC_ENABLE_NOTIFICATIONS'] as boolean | undefined,
  enableActivity: process.env['NEXT_PUBLIC_ENABLE_ACTIVITY'] as boolean | undefined,
  enableSessionKey: process.env['NEXT_PUBLIC_ENABLE_SESSION_KEY'] as boolean | undefined,
  enableEmailSettings: process.env['NEXT_PUBLIC_ENABLE_EMAIL_SETTINGS'] as boolean | undefined,
  enableFaucet: process.env['NEXT_PUBLIC_ENABLE_FAUCET'] as boolean | undefined,
  enableGraphQl: process.env['NEXT_PUBLIC_ENABLE_GRAPHQL'] as boolean | undefined,
  enableContributionPage: process.env['NEXT_PUBLIC_ENABLE_CONTRIBUTION_PAGE'] as
    | boolean
    | undefined,
  enableOnchainActivities: process.env['NEXT_PUBLIC_ENABLE_ONCHAIN_ACTIVITIES'] as
    | boolean
    | undefined,
  enableSquidDataSource: process.env['NEXT_PUBLIC_ENABLE_SQUID_DATA_SOURCE'] as boolean | undefined,
}

export const connectionsOverrides: Partial<ConnectionsSettings> = {
  substrateUrl: process.env['NEXT_PUBLIC_SUBSTRATE_URL'],
  offchainUrl: process.env['NEXT_PUBLIC_OFFCHAIN_URL'],
  graphqlUrl: process.env['NEXT_PUBLIC_GRAPHQL_URL'],
  ipfsNodeUrl: process.env['NEXT_PUBLIC_IPFS_NODE_URL'],
  offchainSignerUrl: process.env['NEXT_PUBLIC_OFFCHAIN_SIGNER_URL'],
}
