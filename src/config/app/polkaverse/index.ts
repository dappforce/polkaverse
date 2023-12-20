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
  suggestedTlds: ['sub', 'polka'],
  creatorIds: [
    '11414',
    '4809',
    '4777',
    '6953',
    '10132',
    '6283',
    '11581',
    '7366',
    '11157',
    '11566',
    '10124',
    '11581',
    '1573',
    '1238',
    '11844',
  ],
}

export default index
