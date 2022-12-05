import app from './app'
import availableFeatures from './availableFeatures'
import common from './common'
import connections from './connections'

export default {
  ...common,
  ...app,
  ...connections,
  ...availableFeatures,
}
