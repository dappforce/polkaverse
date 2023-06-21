// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { gaId } from '../env'
import { SubsocialConfig } from '../types'

const localConfig: SubsocialConfig = {
  substrateUrl: 'ws://localhost:8844',
  kusamaUrl: 'wss://staging.subsocial.network/kusama',

  offchainUrl: 'http://localhost:3001',
  graphqlUrl: 'https://staging.subsocial.network/hydra/graphql',

  ipfsNodeUrl: 'http://127.0.0.1:8080',
  dagHttpMethod: 'post',
  useOffchainForIpfs: false,

  subIdApiUrl: 'https://sub.id/api/v1',
  subsocialParaId: 2100,

  nodes: {
    kusama: 'wss://kusama-rpc.polkadot.io',
  },

  ga: {
    id: gaId,
    options: {
      debug: true,
      gaOptions: {
        cookieDomain: 'none',
      },
    },
  },
}

export default localConfig
