import { nonEmptyStr } from '@subsocial/utils'
import app from './app'
import connections from './connections'
import { featureOverrides as env } from './env'
import { CommonSubsocialFeatures, SubsocialFeatures } from './types'
import { getOrFalse, getOrTrue } from './utils'

const enableGraphQl = getOrTrue(env.enableGraphQl) && nonEmptyStr(connections.graphqlUrl)
const commonFeatures: CommonSubsocialFeatures = {
  enableSearch: getOrTrue(env.enableSearch),
  enableFeed: getOrTrue(env.enableFeed),
  enableNotifications: getOrTrue(env.enableNotifications),
  enableActivity: getOrTrue(env.enableActivity),
  enableSessionKey: getOrFalse(env.enableSessionKey),
  enableEmailSettings: getOrFalse(env.enableEmailSettings),
  enableFaucet: getOrFalse(env.enableFaucet),
  enableGraphQl,
  enableSubnetMode: nonEmptyStr(app.subnetId),
  enableContributionPage: getOrTrue(env.enableContributionPage),
  enableOnchainActivities: getOrFalse(!enableGraphQl),
  enableDomains: getOrFalse(true),
  enableSquidDataSource: getOrTrue(env.enableSquidDataSource) && enableGraphQl,
}

const features: SubsocialFeatures = {
  ...commonFeatures,
}

export default features
