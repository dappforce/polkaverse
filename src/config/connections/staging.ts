import { SubsocialConfig } from '../types'

const stagingConfig: SubsocialConfig = {
  sudoOne: '3osmnRNnrcScHsgkTJH1xyBF5kGjpbWHsGrqM31BJpy4vwn8',

  substrateUrl: 'wss://rco-para.subsocial.network',
  kusamaUrl: 'wss://staging.subsocial.network/kusama',

  offchainUrl: 'https://staging-api.subsocial.network',
  offchainWs: 'wss://staging.subsocial.network/notif-ws',
  graphqlUrl: undefined,

  ipfsNodeUrl: 'https://staging-ipfs.subsocial.network',
  dagHttpMethod: 'get',
  useOffchainForIpfs: true,

  nodes: {
    kusama: 'wss://kusama-rpc.polkadot.io',
  },

  subIdApiUrl: 'https://staging.sub.id/api/v1',
  subsocialParaId: 2100,
}

export default stagingConfig
