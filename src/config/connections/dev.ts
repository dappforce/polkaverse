import { SubsocialConfig } from '../types'
import mainConfig from './main'

const devConfig: SubsocialConfig = {
  ...mainConfig,
  substrateUrl: 'wss://para.subsocial.network',
}

export default devConfig
