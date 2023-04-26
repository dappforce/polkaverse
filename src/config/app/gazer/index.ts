import { AppConfig } from '../../types'

const index: AppConfig = {
  // App settings
  appName: 'xGazer',
  appLogo: '/images/gazer/gazer-logo-big.svg',
  mobileAppLogo: '/images/gazer/gazer-logo-pink.svg',
  appBaseUrl: 'https://x.gazer.app',
  themeName: undefined,
  metaTags: {
    siteName: 'xGazer',
    title: 'xGazer On xSocial - Create Cust Communities On Grill.chat',
    desc: 'Use xGazer to easily create your own chat rooms on Grill.chat for you and your community. Pick a name, add an image, and get started talking with your community!',
    defaultImage: '/images/gazer/gazer-cover.png',
  },
  subnetId: undefined,
  canonicalUrl: 'https://x.gazer.app',
  // app specific features
  resolvedDomain: 'sub',
  // Reserved spaces
  lastReservedSpaceId: '1000',
  claimedSpaceIds: [],
  recommendedSpaceIds: ['1002', '1005'],
  suggestedTlds: [],
}

export default index
