import { SubsocialConfig } from '../types'
import mainConfig from './main'

const devConfig: SubsocialConfig = {
  ...mainConfig,
  substrateUrl: 'wss://para.subsocial.network',

  // needed for e2e test env
  offchainSignerUrl: 'http://127.0.0.1:3000',
}

export default devConfig
