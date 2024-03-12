import { useAnalytics } from './analytics'
import { useMyAccount } from './my-account'

// order of the registry can be important if you have dependencies between stores in the init function.
const storesRegistry = [useAnalytics, useMyAccount]

export const initAllStores = () => {
  storesRegistry.forEach(store => {
    const state = store.getState() as { init?: () => void }
    if (typeof state.init === 'function') {
      state.init()
    }
  })
}
