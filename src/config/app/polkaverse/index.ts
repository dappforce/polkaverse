import { AppConfig } from '../../types'
import polkaverseSpaces from './polkaverseSpaces'

const index: AppConfig = {
  // App settings
  appName: 'PolkaVerse',
  appLogo: '/polkaverse-logo.svg',
  mobileAppLogo: '/polkaverse-sign.svg',
  appBaseUrl: 'https://polkaverse.com',
  themeName: undefined,
  metaTags: {
    siteName: 'PolkaVerse',
    title: "PolkaVerse – Polkadot's Premier Social Network",
    desc: 'The #1 decentralized social network for Polkadot and Kusama. Build and own your Web3 network and track the latest updates from the Dotsama ecosystem today!',
    defaultImage: '/polkaverse.png',
  },
  subnetId: undefined,
  canonicalUrl: 'https://polkaverse.com',
  // app specific features
  resolvedDomain: 'sub',
  // Reserved spaces
  lastReservedSpaceId: '1000',
  claimedSpaceIds: ['1', '2', '3', '4', '5'],
  recommendedSpaceIds: polkaverseSpaces,
  suggestedTlds: [],
}

export default index
