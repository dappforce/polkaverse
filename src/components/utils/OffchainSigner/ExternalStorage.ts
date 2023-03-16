import { createStorageKey } from 'src/utils/storage'
import store from 'store'

const OFFCHAIN_ADDRESS_KEY = 'df.OffchainAddress'
const PROXY_ADDRESS_KEY = 'df.ProxyAddress'
const OFFCHAIN_TOKEN_KEY = 'df.OffchainToken'
const isCurrentOffchainAddress = (myAddress: string) =>
  store.get(createStorageKey(OFFCHAIN_ADDRESS_KEY, myAddress)) === 1 ? true : false
const getProxyAddress = (myAddress: string): string | undefined =>
  store.get(createStorageKey(PROXY_ADDRESS_KEY, myAddress))
const getOffchainToken = (myAddress: string): string | undefined =>
  store.get(createStorageKey(OFFCHAIN_TOKEN_KEY, myAddress))

export {
  OFFCHAIN_ADDRESS_KEY,
  OFFCHAIN_TOKEN_KEY,
  PROXY_ADDRESS_KEY,
  getProxyAddress,
  getOffchainToken,
  isCurrentOffchainAddress,
}
