import { createStorageKey } from 'src/utils/storage'
import store from 'store'

const OFFCHAIN_ADDRESS_KEY = 'OffchainAddress'
const PROXY_ADDRESS_KEY = 'ProxyAddress'
const OFFCHAIN_TOKEN_KEY = 'OffchainToken'
const OFFCHAIN_REFRESH_TOKEN_KEY = 'OffchainRefreshToken'
const REGISTERING_ADDRESS = 'RegisteringAddress'
const MNEMONIC = 'Mnemonic'

const isCurrentOffchainAddress = (myAddress: string) =>
  store.get(createStorageKey(OFFCHAIN_ADDRESS_KEY, myAddress)) === 1 ? true : false
const getProxyAddress = (myAddress: string): string | undefined =>
  store.get(createStorageKey(PROXY_ADDRESS_KEY, myAddress))

const getOffchainToken = (myAddress: string): string | undefined =>
  store.get(createStorageKey(OFFCHAIN_TOKEN_KEY, myAddress))
const getOffchainRefreshToken = (myAddress: string): string | undefined =>
  store.get(createStorageKey(OFFCHAIN_REFRESH_TOKEN_KEY, myAddress))

const getRegisteringAddress = (): string | undefined =>
  store.get(createStorageKey(REGISTERING_ADDRESS))
const getMnemonicFromAddress = (myAddress: string): string | undefined =>
  store.get(createStorageKey(MNEMONIC, myAddress))

export {
  OFFCHAIN_ADDRESS_KEY,
  OFFCHAIN_TOKEN_KEY,
  OFFCHAIN_REFRESH_TOKEN_KEY,
  REGISTERING_ADDRESS,
  MNEMONIC,
  PROXY_ADDRESS_KEY,
  getProxyAddress,
  getOffchainToken,
  getOffchainRefreshToken,
  isCurrentOffchainAddress,
  getRegisteringAddress,
  getMnemonicFromAddress,
}
