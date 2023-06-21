// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { newLogger } from '@subsocial/utils'
import { AppConfig, AppKind, ConnectionKind, ConnectionsSettings, SubsocialFeatures } from './types'
export const nodeEnv = getEnv('NODE_ENV')

newLogger.setDefaultLevel(getEnv('LOG_INFO') as any)

export const isProdMode = nodeEnv === 'production'
export const isDevMode = !isProdMode

export const appKind = (getEnv('APP_KIND') || 'polkaverse') as unknown as AppKind

export const connectionKind = (getEnv('CONNECTION_KIND') || 'main') as unknown as ConnectionKind

export const enableMaintenancePage = getEnvAsBool('ENABLE_MAINTENANCE_PAGE')
export const maintenanceMsg = getEnv('MAINTENANCE_TEXT')

export const gaId = getEnv('GA_ID') || ''

export const hCaptchaSiteKey = getEnv('HCAPTCHA_SITE_KEY') || ''

export const appOverrides: Partial<AppConfig> = {
  appBaseUrl: getEnv('APP_BASE_URL'),
}

/**
 * Enable or disable the available features of this web app by overriding them in the .env file.
 */
export const featureOverrides: SubsocialFeatures = {
  enableSearch: getEnvAsBool('ENABLE_SEARCH'),
  enableFeed: getEnvAsBool('ENABLE_FEED'),
  enableNotifications: getEnvAsBool('ENABLE_NOTIFICATIONS'),
  enableActivity: getEnvAsBool('ENABLE_ACTIVITY'),
  enableSessionKey: getEnvAsBool('ENABLE_SESSION_KEY'),
  enableEmailSettings: getEnvAsBool('ENABLE_EMAIL_SETTINGS'),
  enableFaucet: getEnvAsBool('ENABLE_FAUCET'),
  enableGraphQl: getEnvAsBool('ENABLE_GRAPHQL'),
  enableContributionPage: getEnvAsBool('ENABLE_CONTRIBUTION_PAGE'),
  enableOnchainActivities: getEnvAsBool('ENABLE_ONCHAIN_ACTIVITIES'),
  enableSquidDataSource: getEnvAsBool('ENABLE_SQUID_DATA_SOURCE'),
}

export const connectionsOverrides: Partial<ConnectionsSettings> = {
  substrateUrl: getEnv('SUBSTRATE_URL'),
  offchainUrl: getEnv('OFFCHAIN_URL'),
  graphqlUrl: getEnv('GRAPHQL_URL'),
  ipfsNodeUrl: getEnv('IPFS_NODE_URL'),
  offchainSignerUrl: getEnv('OFFCHAIN_SIGNER_URL'),
}

function getEnv(varName: string): string | undefined {
  const { env } = process
  return env[varName]
}

function getEnvAsBool(varName: string): boolean | undefined {
  const val = getEnv(varName)?.toString()?.toLowerCase()
  if (val === 'true') return true
  if (val === 'false') return false
  return undefined
}

// function getEnvAsArray (varName: string): string[] {
//   return getEnv(varName)?.split(',').map(id => id.trim()) || []
// }

// function getEnvAsNumber (varName: string) {
//   const value = getEnv(varName)
//   return value ? parseInt(value) : undefined
// }

// function getEnvAsDate (varName: string) {
//   const dateStr = getEnv(varName)
//   try {
//     return dateStr ? dayjs(dateStr) : undefined
//   } catch (err) {
//     return undefined
//   }
// }
