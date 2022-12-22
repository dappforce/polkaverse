import { GaProps } from 'src/ga'
import { SpaceId } from 'src/types'

export type AppKind = 'polkaverse' | 'staging'

export type ConnectionKind = 'main' | 'local' | 'staging' | 'dev'

export type NodeUrls = {
  kusama: string
}

export type NodeNames = keyof NodeUrls

export type SubsocialConfig = ConnectionsSettings & {
  /**
   * The first sudo account used to reserve spaces for projects that received
   * a technical grant from Web3 Foundation (aka Polkadot projects).
   */
  sudoOne?: string

  /**
   * A URL of a Sub.ID RestAPI. Example: `http://localhost:3001`
   */
  subIdApiUrl: string
  subsocialParaId: number

  /**
   * An HTTP method that should be used when requesting for content from IPFS
   * via Subsocial's Offchain service. A `get` method has no CORS restrictions,
   * but you will have a restriction for the max length of your request URL. Thus
   * only a limited number of CIDs (around 40 or so) can be passed with a `get` request.
   * A `post` method allows to fetch contents by many CIDs (hundreds), but Subsocial's
   * Offchain CORS policy allows `post` method to be used only on subsocial.network, etc.
   */
  dagHttpMethod: 'get' | 'post'

  /** Should the app get content from IPFS node hosted on Subsocial's Offchain? */
  useOffchainForIpfs?: boolean

  nodes?: NodeUrls

  // Settings related to Google services:

  ga?: GaProps
}

export type ConnectionsSettings = {
  // Substrate-related settings:

  /** A URL of a Substrate node. Example: `'ws://localhost:9944'`. */
  substrateUrl: string

  /** A URL of a Kusama node. Example: `'kusama-rpc.polkadot.io'`. */
  kusamaUrl?: string

  // Subsocial's Offchain services:

  /** A URL of a Subsocial Offchain service. Example: `'http://localhost:3001'`. */
  offchainUrl: string

  /** A URL of Subsocial's GraphQL server. Example: `http://localhost:4000/graphql`. */
  graphqlUrl?: string

  // IPFS settings:

  /**
   * A URL of an IPFS node hosted on Subsocial's Offchain.
   * Examples:
   * - `'http://127.0.0.1:8080'` – `8080` port for read only access.
   * - `'http://127.0.0.1:5001'` – `5001` port for write access via IPFS Go.
   */
  ipfsNodeUrl: string
}

export type AppConfig = {
  appName: string
  appLogo: string
  mobileAppLogo: string
  appBaseUrl: string
  themeName?: string
  metaTags: {
    siteName: string
    title: string
    desc: string
    defaultImage: string
  }
  subnetId?: SpaceId
  canonicalUrl: string
  resolvedDomain: string
  // Reserved spaces
  lastReservedSpaceId: SpaceId
  claimedSpaceIds: SpaceId[]
  recommendedSpaceIds: SpaceId[]
  suggestedTlds?: string[]
}

export type CommonSubsocialFeatures = {
  enableSearch?: boolean
  enableFeed?: boolean
  enableNotifications?: boolean
  enableActivity?: boolean
  enableSessionKey?: boolean
  enableEmailSettings?: boolean
  enableFaucet?: boolean
  enableGraphQl?: boolean
  enableSubnetMode?: boolean
  enableContributionPage?: boolean
  enableOnchainActivities?: boolean
  enableDomains?: boolean
  enableSquidDataSource?: boolean
}

export type SubsocialFeatures = CommonSubsocialFeatures
