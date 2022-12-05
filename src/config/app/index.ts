import { appKind, appOverrides } from '../env'
import polkaverse from './polkaverse'
import staging from './staging'

const apps = {
  polkaverse,
  staging,
}

const currentConfig = apps[appKind]
if (!currentConfig) {
  throw Error(`APP KIND: ${appKind} is not supported`)
}
Object.entries(appOverrides).forEach(([key, value]) => {
  if (value) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    currentConfig[key] = value
  }
})

export default currentConfig
