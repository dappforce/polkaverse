import { SubsocialConfig } from '../types'

const devConfig: SubsocialConfig = {
  substrateUrl: 'wss://rco-para.subsocial.network',
  offchainUrl: 'https://staging-api.subsocial.network',
  graphqlUrl: 'https://squid.subsquid.io/soonsocial/graphql',

  ipfsNodeUrl: 'https://ipfs.subsocial.network',
  dagHttpMethod: 'get',
  useOffchainForIpfs: false,

  subIdApiUrl: 'https://sub.id/api/v1',
  subsocialParaId: 2100,
}

export default devConfig
