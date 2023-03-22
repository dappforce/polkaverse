import { SubsocialConfig } from '../types'

const stagingConfig: SubsocialConfig = {
  sudoOne: '3si9SFRhEPKvpk2xW9dUkcud1AanQxJwok2QFqppqE5ZeShp',

  substrateUrl: 'wss://rco-para.subsocial.network',
  offchainUrl: 'https://staging-api.subsocial.network',
  graphqlUrl: 'https://squid.subsquid.io/soonsocial/graphql',

  ipfsNodeUrl: 'https://staging-ipfs.subsocial.network',
  dagHttpMethod: 'get',
  useOffchainForIpfs: false,

  subIdApiUrl: 'https://sub.id/api/v1',
  subsocialParaId: 2100,

  offchainSignerUrl: 'https://staging-signer.subsocial.network',
  // offchainSignerUrl: 'http://127.0.0.1:3102', for e2e tests purposes, run server locally
}

export default stagingConfig
