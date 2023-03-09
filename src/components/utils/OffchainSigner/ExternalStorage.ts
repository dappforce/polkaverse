import { createStorageKey } from 'src/utils/storage'
import store from 'store'

const OFFCHAIN_ADDRESS_KEY = 'OffchainAddress'
const PROXY_ADDRESS_KEY = 'ProxyAddress'
const OFFCHAIN_TOKEN_KEY = 'OffchainToken'
const OFFCHAIN_REFRESH_TOKEN_KEY = 'OffchainRefreshToken'
const SECRET_KEY = 'SecretKey'
const SALT = 'Salt'
const NONCE = 'Nonce'

const isCurrentOffchainAddress = (myAddress: string) =>
  store.get(createStorageKey(OFFCHAIN_ADDRESS_KEY, myAddress)) === 1 ? true : false
const getProxyAddress = (myAddress: string): string | undefined =>
  store.get(createStorageKey(PROXY_ADDRESS_KEY, myAddress))

const getOffchainToken = (myAddress: string): string | undefined =>
  store.get(createStorageKey(OFFCHAIN_TOKEN_KEY, myAddress))
const getOffchainRefreshToken = (myAddress: string): string | undefined =>
  store.get(createStorageKey(OFFCHAIN_REFRESH_TOKEN_KEY, myAddress))

const getSecretKeyByAddress = (myAddress: string): string | undefined =>
  store.get(createStorageKey(SECRET_KEY, myAddress))

export {
  OFFCHAIN_ADDRESS_KEY,
  OFFCHAIN_TOKEN_KEY,
  OFFCHAIN_REFRESH_TOKEN_KEY,
  SECRET_KEY,
  PROXY_ADDRESS_KEY,
  SALT,
  NONCE,
  getProxyAddress,
  getOffchainToken,
  getOffchainRefreshToken,
  isCurrentOffchainAddress,
  getSecretKeyByAddress,
}
