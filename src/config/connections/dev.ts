import { SubsocialConfig } from '../types'
import mainConfig from './main'

const devConfig: SubsocialConfig = {
  ...mainConfig,
  substrateUrl: 'wss://para.subsocial.network',

  // needed for e2e test env
  offchainSignerUrl: 'https://staging-signer.subsocial.network',
}

export default devConfig
