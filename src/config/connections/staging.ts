import { SubsocialConfig } from '../types'

const stagingConfig: SubsocialConfig = {
  sudoOne: '3si9SFRhEPKvpk2xW9dUkcud1AanQxJwok2QFqppqE5ZeShp',

  substrateUrl: 'wss://rco-para.subsocial.network',
  substrateRpcUrl: 'https://rco-para.subsocial.network/http',
  offchainUrl: 'https://staging-api.subsocial.network',
  offchainSignerUrl: 'https://staging-signer.subsocial.network',
  graphqlUrl: 'https://squid.subsquid.io/soonsocial/graphql',

  ipfsNodeUrl: 'https://staging-ipfs.subsocial.network',
  dagHttpMethod: 'get',
  useOffchainForIpfs: false,

  subIdApiUrl: 'https://rococo-subid.subsocial.network/api/v1',
  subsocialParaId: 2100,
}

export default stagingConfig
