import { gaId } from '../env'
import { SubsocialConfig } from '../types'

const mainConfig: SubsocialConfig = {
  sudoOne: '3osmnRNnrcScHsgkTJH1xyBF5kGjpbWHsGrqM31BJpy4vwn8',

  substrateUrl: 'wss://api-subsocial.dwellir.com/d3b15e09-ebc8-48de-94af-907466466d10',
  substrateRpcUrl: 'https://api-subsocial.dwellir.com/d3b15e09-ebc8-48de-94af-907466466d10',
  kusamaUrl: 'wss://kusama-rpc.polkadot.io',

  offchainUrl: 'https://api.subsocial.network',
  offchainSignerUrl: 'https://signer.subsocial.network',
  graphqlUrl: 'https://squid.subsquid.io/subsocial/graphql',
  sellerSquid: 'https://squid.subsquid.io/x-seller-dot-sub/graphql',

  ipfsNodeUrl: 'https://ipfs.subsocial.network',

  dagHttpMethod: 'post',
  useOffchainForIpfs: false,

  subIdApiUrl: 'https://sub.id/api/v1',
  subsocialParaId: 2100,

  nodes: {
    kusama: 'wss://kusama-rpc.polkadot.io',
  },

  ga: {
    id: gaId,
  },
}

export default mainConfig
