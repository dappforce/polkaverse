import { /* connectionKind, */ connectionsOverrides } from '../env'
import { SubsocialConfig } from '../types'
import dev from './dev'
import local from './local'
import main from './main'
import staging from './staging'

const connectionPresets = {
  local,
  main,
  staging,
  dev,
}

// const currentConfig: SubsocialConfig = connectionPresets[connectionKind]
const currentConfig: SubsocialConfig = connectionPresets['staging']

Object.entries(connectionsOverrides).forEach(([key, value]) => {
  if (value) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    currentConfig[key] = value
  }
})

export default currentConfig
