import { toSubsocialAddress } from '@subsocial/utils'
import { getSubsocialApi } from 'src/components/utils/SubsocialConnect'
import { ESTIMATED_ENERGY_FOR_ONE_TX } from 'src/config/constants'
import { waitNewBlock } from 'src/utils/blockchain'
import { wait } from 'src/utils/promise'
import { LocalStorage } from 'src/utils/storage'
import {
  decodeSecretKey,
  encodeSecretKey,
  generateAccount,
  isSecretKeyUsingMiniSecret,
  KeyringSigner,
  loginWithSecretKey,
} from '../utils/account'
import { create } from './utils'

type State = {
  isInitialized?: boolean
  isInitializedProxy?: boolean

  preferredWallet: any | null
  connectedWallet:
    | {
        address: string
        signer: KeyringSigner | null
        energy?: number
        _unsubscribeEnergy?: () => void
      }
    | undefined
  parentProxyAddress: string | undefined

  address: string | null
  signer: KeyringSigner | null
  energy: number | null
  encodedSecretKey: string | null
  _unsubscribeEnergy: () => void
}

type Actions = {
  login: (secretKey?: string, config?: { isInitialization?: boolean }) => Promise<string | false>
  logout: () => void
  _subscribeEnergy: () => void
  _subscribeConnectedWalletEnergy: () => void
}

const initialState: State = {
  connectedWallet: undefined,
  preferredWallet: null,
  parentProxyAddress: undefined,
  address: null,
  signer: null,
  energy: null,
  encodedSecretKey: null,
  _unsubscribeEnergy: () => undefined,
}

export const accountAddressStorage = new LocalStorage(() => 'accountPublicKey')
const accountStorage = new LocalStorage(() => 'account')
const parentProxyAddressStorage = new LocalStorage(() => 'connectedWalletAddress')

export const useMyAccount = create<State & Actions>()((set, get) => ({
  ...initialState,
  _subscribeConnectedWalletEnergy: () => {
    const { connectedWallet } = get()
    if (!connectedWallet) return

    const { address } = connectedWallet
    const unsub = subscribeEnergy(address, energy => {
      const wallet = get().connectedWallet
      if (!wallet) return
      set({ connectedWallet: { ...wallet, energy } })
    })
    set({
      connectedWallet: {
        ...connectedWallet,
        _unsubscribeEnergy: () => unsub.then(unsub => unsub?.()),
      },
    })
  },
  login: async secretKey => {
    const { toSubsocialAddress } = await import('@subsocial/utils')
    let address = ''
    try {
      if (!secretKey) {
        secretKey = (await generateAccount()).secretKey
      } else if (secretKey.startsWith('0x')) {
        const augmented = secretKey.substring(2)
        if (isSecretKeyUsingMiniSecret(augmented)) {
          secretKey = augmented
        }
      }

      const signer = await loginWithSecretKey(secretKey)
      const encodedSecretKey = encodeSecretKey(secretKey)
      address = toSubsocialAddress(signer.address)!

      set({
        address,
        signer,
        encodedSecretKey,
      })
      get()._subscribeEnergy()
    } catch (e) {
      console.error('Failed to login', e)
      return false
    }
    return address
  },
  _subscribeEnergy: () => {
    const { address, _unsubscribeEnergy } = get()
    _unsubscribeEnergy()

    const unsub = subscribeEnergy(address, energy => {
      set({ energy })
    })
    set({ _unsubscribeEnergy: () => unsub.then(unsub => unsub?.()) })
  },
  logout: () => {
    const { _unsubscribeEnergy } = get()
    _unsubscribeEnergy()

    accountStorage.remove()
    accountAddressStorage.remove()
    parentProxyAddressStorage.remove()

    set({ ...initialState, isInitialized: true, isInitializedProxy: true })
  },
  init: async () => {
    const { isInitialized, login } = get()

    // Prevent multiple initialization
    if (isInitialized !== undefined) return
    set({ isInitialized: false, isInitializedProxy: false })

    const encodedSecretKey = accountStorage.get()
    const parentProxyAddress = parentProxyAddressStorage.get()

    if (encodedSecretKey) {
      const storageAddress = accountAddressStorage.get()
      set({ address: storageAddress || undefined })

      const secretKey = decodeSecretKey(encodedSecretKey)
      const address = await login(secretKey, { isInitialization: true })

      if (!address) {
        accountStorage.remove()
        accountAddressStorage.remove()
        set({ address: null })
      }
    }

    set({ isInitialized: true })

    if (parentProxyAddress) {
      set({ parentProxyAddress })
      try {
        const proxy = await getProxies(parentProxyAddress)
        const isProxyValid = proxy.includes(get().address ?? '')
        if (!isProxyValid) {
          parentProxyAddressStorage.remove()
          set({ parentProxyAddress: undefined })
          get().logout()
          // TODO: change to a proper notification
          alert(
            'You seem to have logged in to your wallet in another device, please relogin to use it here',
          )
        }
      } catch (err) {
        console.error('Failed to fetch proxies', err)
      }
    }

    set({ isInitializedProxy: true })

    window.addEventListener(
      'storage',
      function (event) {
        if (event.key === 'account' && !event.newValue) {
          get().logout()
        }
      },
      false,
    )
  },
}))

async function getProxies(address: string) {
  const api = getSubsocialApi()
  const substrateApi = await api.substrateApi
  const proxies = await substrateApi.query.proxy.proxies(address)
  return proxies
    .map(proxy => {
      const proxyData = proxy.toPrimitive()
      if (Array.isArray(proxyData)) {
        return toSubsocialAddress((proxyData[0] as any)?.delegate)!
      }
      return null
    })
    .filter(Boolean) as string[]
}

async function subscribeEnergy(
  address: string | null,
  onEnergyUpdate: (energy: number) => void,
  isRetrying?: boolean,
): Promise<undefined | (() => void)> {
  if (!address) return

  const subsocialApi = await getSubsocialApi()
  const substrateApi = await subsocialApi.substrateApi
  if (!substrateApi.isConnected && !isRetrying) {
    await substrateApi.disconnect()
    await substrateApi.connect()
  }

  if (!substrateApi.isConnected) {
    // If energy subscription is run when the api is not connected, even after some more ms it connect, the subscription won't work
    // Here we wait for some delay because the api is not connected immediately even after awaiting the connect() method.
    // And we retry it recursively after 500ms delay until it's connected (without reconnecting the api again)
    await wait(500)
    return subscribeEnergy(address, onEnergyUpdate, true)
  }

  let prev: null | number = null
  const unsub = substrateApi.query.energy.energyBalance(address, async energyAmount => {
    let parsedEnergy: unknown = energyAmount
    if (typeof energyAmount.toPrimitive === 'function') {
      parsedEnergy = energyAmount.toPrimitive()
    }

    const energy = parseFloat(parsedEnergy + '')
    if (prev !== null && prev < ESTIMATED_ENERGY_FOR_ONE_TX) await waitNewBlock()

    prev = energy

    console.log('Current energy: ', address, energy)
    onEnergyUpdate(energy)
  })
  return unsub
}

export function getIsLoggedIn() {
  return !!accountStorage.get()
}
