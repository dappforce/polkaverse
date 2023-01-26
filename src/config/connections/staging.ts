import { SubsocialConfig } from '../types'

const stagingConfig: SubsocialConfig = {
  sudoOne: '3si9SFRhEPKvpk2xW9dUkcud1AanQxJwok2QFqppqE5ZeShp',

  substrateUrl: 'wss://rco-para.subsocial.network',
  offchainUrl: 'https://staging-api.subsocial.network',
  graphqlUrl: undefined,

  ipfsNodeUrl: 'https://staging-ipfs.subsocial.network',
  dagHttpMethod: 'get',
  useOffchainForIpfs: false,

  subIdApiUrl: 'https://sub.id/api/v1',
  subsocialParaId: 2100,
}

export default stagingConfig
