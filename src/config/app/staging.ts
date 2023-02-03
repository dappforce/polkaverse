import { AppConfig } from '../types'

const recommendedSpaceIds = ['1030', '1040', '1005', '1018', '1058', '1057', '1059', '1069', '1068']

const staging: AppConfig = {
  // App settings
  appName: 'Staging',
  appLogo: '/polkaverse-logo.svg',
  mobileAppLogo: '/polkaverse-sign.svg',
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
  recommendedSpaceIds,
}

export default staging
