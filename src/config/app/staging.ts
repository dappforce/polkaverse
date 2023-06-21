// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { AppConfig } from '../types'

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
  recommendedSpaceIds: ['1001', '1002', '1003'],
}

export default staging
