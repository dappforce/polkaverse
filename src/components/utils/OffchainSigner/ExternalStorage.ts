import { createStorageKey } from 'src/utils/storage'
import store from 'store'

const OFFCHAIN_ADDRESS_KEY = 'df.OffchainAddress'
const PROXY_ADDRESS_KEY = 'df.ProxyAddress'
const OFFCHAIN_TOKEN_KEY = 'df.OffchainToken'
const OFFCHAIN_REFRESH_TOKEN_KEY = 'df.OffchainRefreshToken'
const SECRET_KEY = 'df.SecretKey'
const NONCE = 'df.Nonce'
const SALT = 'df.Salt'
const SALT_NONCE = 'df.SaltNonce'

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

const getNonceByAddress = (myAddress: string): string | undefined =>
  store.get(createStorageKey(NONCE, myAddress))

const getSaltByAddress = (myAddress: string): string | undefined =>
  store.get(createStorageKey(SALT, myAddress))

const getSaltNonceByAddress = (myAddress: string): string | undefined =>
  store.get(createStorageKey(SALT_NONCE, myAddress))

export {
  OFFCHAIN_ADDRESS_KEY,
  OFFCHAIN_TOKEN_KEY,
  OFFCHAIN_REFRESH_TOKEN_KEY,
  PROXY_ADDRESS_KEY,
  SECRET_KEY,
  NONCE,
  SALT,
  SALT_NONCE,
  getProxyAddress,
  getOffchainToken,
  getOffchainRefreshToken,
  isCurrentOffchainAddress,
  getSecretKeyByAddress,
  getNonceByAddress,
  getSaltByAddress,
  getSaltNonceByAddress,
}
