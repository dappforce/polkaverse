import { createStorageKey } from 'src/utils/storage'
import store from 'store'

const OFFCHAIN_ADDRESS_KEY = 'df.OffchainAddress'
const PROXY_ADDRESS_KEY = 'df.ProxyAddress'
const OFFCHAIN_TOKEN_KEY = 'df.OffchainToken'
const OFFCHAIN_REFRESH_TOKEN_KEY = 'df.OffchainRefreshToken'
const TEMP_REGISTER_ACCOUNT = 'df.TempRegisterAccount'
const SECRET_KEY = 'df.SecretKey'
const SALT = 'df.Salt'

const getTempRegisterAccount = (): string | undefined =>
  store.get(createStorageKey(TEMP_REGISTER_ACCOUNT))

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

const getSaltByAddress = (myAddress: string): string | undefined =>
  store.get(createStorageKey(SALT, myAddress))

export {
  OFFCHAIN_ADDRESS_KEY,
  OFFCHAIN_TOKEN_KEY,
  OFFCHAIN_REFRESH_TOKEN_KEY,
  TEMP_REGISTER_ACCOUNT,
  PROXY_ADDRESS_KEY,
  SECRET_KEY,
  SALT,
  getProxyAddress,
  getOffchainToken,
  getOffchainRefreshToken,
  getTempRegisterAccount,
  isCurrentOffchainAddress,
  getSecretKeyByAddress,
  getSaltByAddress,
}
