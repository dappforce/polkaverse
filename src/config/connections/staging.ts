// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { SubsocialConfig } from '../types'

const stagingConfig: SubsocialConfig = {
  sudoOne: '3si9SFRhEPKvpk2xW9dUkcud1AanQxJwok2QFqppqE5ZeShp',

  substrateUrl: 'wss://rco-para.subsocial.network',
  offchainUrl: 'https://staging-api.subsocial.network',
  offchainSignerUrl: 'https://staging-signer.subsocial.network',
  graphqlUrl: 'https://squid.subsquid.io/soonsocial/graphql',

  ipfsNodeUrl: 'https://staging-ipfs.subsocial.network',
  dagHttpMethod: 'get',
  useOffchainForIpfs: false,

  subIdApiUrl: 'https://sub.id/api/v1',
  subsocialParaId: 2100,
}

export default stagingConfig
