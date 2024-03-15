import { AppConfig } from '../../types'
import polkaverseSpaces from './polkaverseSpaces'

const index: AppConfig = {
  // App settings
  appName: 'PolkaVerse',
  appLogo: '/grill.svg',
  mobileAppLogo: '/grill.svg',
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
  promotedPosts: [],
  recommendedSpaceIds: polkaverseSpaces,
  suggestedTlds: ['sub', 'polka'],
  mutedAccounts: {
    '3tPAVaHYAFRfUVpNP1DAq4E3BxTPanzkGN4uukn3b4ZAefkj': [
      '3qz2AHix42fKyfdhenuVou9wCefVcGSMCQo9YzQDHqFyU2RF',
    ],
    '3qz2AHix42fKyfdhenuVou9wCefVcGSMCQo9YzQDHqFyU2RF': [
      '3tPAVaHYAFRfUVpNP1DAq4E3BxTPanzkGN4uukn3b4ZAefkj',
    ],
  },
}

export default index
