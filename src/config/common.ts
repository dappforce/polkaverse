import connections from './connections'
import { connectionKind, getEnv } from './env'

const stagingSiteKey = getEnv('HCAPTCHA_SITE_KEY') || ''

export default {
  // Static URLs:
  landingPageUrl: 'https://subsocial.network',
  faucetUrl: 'https://discord.gg/ps2mvkST3x',
  polkadotAppsUrl: `https://polkadot.js.org/apps/?rpc=${encodeURIComponent(
    connections.substrateUrl,
  )}`,
  polkaStatsUrl: 'https://subsocial.polkastats.io/',

  // SEO-related settings:
  seoSitemapLastmod: '2020-11-21',
  seoSitemapPageSize: 100,

  hCaptchaSiteKey:
    connectionKind !== 'dev' ? stagingSiteKey : '10000000-ffff-ffff-ffff-000000000001',
}
