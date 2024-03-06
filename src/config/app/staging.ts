import { AppConfig } from '../types'

const staging: AppConfig = {
  // App settings
  appName: 'Staging',
  appLogo: '/grill.svg',
  mobileAppLogo: '/grill.svg',
  appBaseUrl: 'https://staging.subsocial.network',
  themeName: undefined,
  metaTags: {
    siteName: 'Staging',
    title: 'Staging',
    desc: 'Staging',
    defaultImage: '/polkaverse.png',
  },
  canonicalUrl: 'https://polkaverse.com',
  // app specific features
  subnetId: undefined,
  resolvedDomain: 'sub',
  // Reserved spaces
  lastReservedSpaceId: '1000',
  claimedSpaceIds: [],
  recommendedSpaceIds: ['1001', '1002', '1003'],
  suggestedTlds: ['sub', 'polka'],
}

export default staging
