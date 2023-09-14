import { gaId } from '../env'
import { SubsocialConfig } from '../types'

const mainConfig: SubsocialConfig = {
  sudoOne: '3osmnRNnrcScHsgkTJH1xyBF5kGjpbWHsGrqM31BJpy4vwn8',

  substrateUrl: 'wss://para.subsocial.network',
  substrateRpcUrl: 'https://para.subsocial.network/http',
  kusamaUrl: 'wss://kusama-rpc.polkadot.io',

  offchainUrl: 'https://api.subsocial.network',
  offchainSignerUrl: 'https://signer.subsocial.network',
  graphqlUrl: 'https://squid.subsquid.io/subsocial/graphql',
  sellerSquid: 'https://squid.subsquid.io/x-seller-squid-rococo-soon/graphql',

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
