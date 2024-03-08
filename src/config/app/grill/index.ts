import { AppConfig } from '../../types'
import featuredCreators from './featuredCreators'

const index: AppConfig = {
  // App settings
  appName: 'Grill',
  appLogo: '/grill.svg',
  mobileAppLogo: '/grill.svg',
  appBaseUrl: 'https://grillapp.net',
  themeName: undefined,
  metaTags: {
    siteName: 'Grill: Monetize Every Like, Comment, Post | Web3 Social',
    title: 'Grill: Monetize Every Like, Comment, Post | Web3 Social',
    desc: 'Revolutionary Web3 social finance platform where bloggers and their followers earn together. Blockchain, NFT, and crypto content.',
    defaultImage: '/images/grill-default-cover.png',
  },
  subnetId: undefined,
  canonicalUrl: 'https://grillapp.net',
  // app specific features
  resolvedDomain: 'sub',
  // Reserved spaces
  lastReservedSpaceId: '1000',
  claimedSpaceIds: ['1', '2', '3', '4', '5'],
  recommendedSpaceIds: featuredCreators,
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
