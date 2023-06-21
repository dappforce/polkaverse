// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

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
}
