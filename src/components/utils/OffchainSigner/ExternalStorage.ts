import { createStorageKey } from 'src/utils/storage'
import store from 'store'

const OFFCHAIN_ADDRESS_KEY = 'OffchainAddress'
const PROXY_ADDRESS_KEY = 'ProxyAddress'
const OFFCHAIN_TOKEN_KEY = 'OffchainToken'
const getProxyAddress = (): string => store.get(PROXY_ADDRESS_KEY)
const isCurrentOffchainAddress = (myAddress: string) =>
  store.get(createStorageKey(OFFCHAIN_ADDRESS_KEY, myAddress)) === 1 ? true : false

export {
  OFFCHAIN_ADDRESS_KEY,
  OFFCHAIN_TOKEN_KEY,
  getProxyAddress,
  isCurrentOffchainAddress,
  PROXY_ADDRESS_KEY,
}
