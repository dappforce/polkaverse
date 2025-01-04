import { SubsocialConfig } from '../types'
import mainConfig from './main'

const devConfig: SubsocialConfig = {
  ...mainConfig,
  substrateUrl: 'wss://para.f3joule.space',
}

export default devConfig
