import connections from './connections'

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

  commentsHubId: '1032',
}
