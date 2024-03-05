import { WarningOutlined } from '@ant-design/icons'
import { toSubsocialAddress } from '@subsocial/utils'
import { controlledMessage } from 'src/components/utils/Message'
import { getSubsocialApi } from 'src/components/utils/SubsocialConnect'
import { getStoreDispatcher } from 'src/rtk/app/store'
import { setMyAddress } from 'src/rtk/features/accounts/myAccountSlice'
import { LocalStorage } from 'src/utils/storage'
import {
  decodeSecretKey,
  encodeSecretKey,
  generateAccount,
  isSecretKeyUsingMiniSecret,
  loginWithSecretKey,
  Signer,
} from '../utils/account'
import { create } from './utils'

type State = {
  isInitialized?: boolean
  isInitializedAddress?: boolean

  parentProxyAddress: string | undefined

  address: string | null
  signer: Signer | null
  encodedSecretKey: string | null
}

type Actions = {
  login: (secretKey?: string, config?: { isInitialization?: boolean }) => Promise<string | false>
  logout: () => void
}

const initialState: State = {
  isInitializedAddress: true,
  parentProxyAddress: undefined,
  address: null,
  signer: null,
  encodedSecretKey: null,
}

export const accountAddressStorage = new LocalStorage(() => 'accountPublicKey')
const accountStorage = new LocalStorage(() => 'account')
const parentProxyAddressStorage = new LocalStorage(() => 'connectedWalletAddress')

export const useMyAccount = create<State & Actions>()((set, get) => ({
  ...initialState,
  login: async (secretKey, config) => {
    const { isInitialization } = config || {}
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
        isInitializedAddress: !!isInitialization,
      })
    } catch (e) {
      console.error('Failed to login', e)
      return false
    }
    return address
  },
  logout: () => {
    accountStorage.remove()
    accountAddressStorage.remove()
    parentProxyAddressStorage.remove()

    set({ ...initialState })
  },
  init: async () => {
    const { isInitialized, login } = get()

    // Prevent multiple initialization
    if (isInitialized !== undefined) return
    set({ isInitialized: false })

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
          const message = controlledMessage({
            message: 'Logged out',
            description:
              'You seem to have logged in to your wallet in another device, please relogin to use it here',
            type: 'warning',
            duration: 3,
            icon: WarningOutlined,
          })
          message.open()
        }
      } catch (err) {
        console.error('Failed to fetch proxies', err)
      }
    }

    const dispatch = getStoreDispatcher()
    const finalAddress = parentProxyAddress || get().address
    if (finalAddress) {
      dispatch?.(setMyAddress(finalAddress))
    }
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
