import { SubsocialConfig } from '../types'

const stagingConfig: SubsocialConfig = {
  sudoOne: '3si9SFRhEPKvpk2xW9dUkcud1AanQxJwok2QFqppqE5ZeShp',

  substrateUrl: 'wss://rco-para.subsocial.network',
  substrateRpcUrl: 'https://rco-para.subsocial.network/http',
  offchainUrl: 'https://api.subsocial.network',
  // offchainSignerUrl: 'https://staging-signer.subsocial.network',
  // graphqlUrl: 'https://squid.subsquid.io/soonsocial/graphql',
  // sellerSquid: 'https://squid.subsquid.io/x-seller-squid-rococo-soon/graphql',

  ipfsNodeUrl: 'https://ipfs.subsocial.network',
  dagHttpMethod: 'get',
  useOffchainForIpfs: false,

  // subIdApiUrl: 'https://sub.id/api/v1',
  subsocialParaId: 2100,

  ga: {
    id: 'fake',
  },
}

export default stagingConfig
