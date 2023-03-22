// import { gaId } from '../env'
import { SubsocialConfig } from '../types'

const mainConfig: SubsocialConfig = {
  sudoOne: '3si9SFRhEPKvpk2xW9dUkcud1AanQxJwok2QFqppqE5ZeShp',

  substrateUrl: 'wss://rco-para.subsocial.network',
  offchainUrl: 'https://staging-api.subsocial.network',
  graphqlUrl: 'https://squid.subsquid.io/soonsocial/graphql',

  ipfsNodeUrl: 'https://staging-ipfs.subsocial.network',
  dagHttpMethod: 'get',
  useOffchainForIpfs: false,

  subIdApiUrl: 'https://rococo-subid.subsocial.network/api/v1',
  subsocialParaId: 2100,

  offchainSignerUrl: 'https://staging-signer.subsocial.network',
}

export default mainConfig
