import { AppConfig } from '../../types'
import forklogSpaces from './forklogSpaces'

const index: AppConfig = {
  // App settings
  appName: 'ForkLog Hub',
  appLogo: '/forklog-logo.svg',
  mobileAppLogo: '/polkaverse-sign.svg',
  appBaseUrl: 'https://polkaverse.com',
  themeName: undefined,
  metaTags: {
    siteName: 'ForkLog',
    title: 'ForkLog',
    desc: '',
    defaultImage: '/forklog-cover.jpg',
  },
  subnetId: undefined,
  canonicalUrl: 'https://grillapp.net',
  // app specific features
  resolvedDomain: 'sub',
  // Reserved spaces
  lastReservedSpaceId: '1000',
  claimedSpaceIds: [],
  recommendedSpaceIds: forklogSpaces,
  // suggestedTlds: ['sub', 'polka'],
}

export default index
