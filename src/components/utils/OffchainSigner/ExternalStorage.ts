import { toSubsocialAddress } from '@subsocial/utils'
import { createStorageKey } from 'src/utils/storage'
import store from 'store'

const SIGNER_ADDRESS_KEY = 'SignerAddress'
const PROXY_ADDRESS_KEY = 'ProxyAddress'
const SIGNER_TOKEN_KEY = 'SignerToken'
const SIGNER_REFRESH_TOKEN_KEY = 'SignerRefreshToken'
const TEMP_REGISTER_ACCOUNT = 'TempRegisterAccount'
const SECRET_KEY = 'SecretKey'
const SALT = 'Salt'
const CURRENT_EMAIL_ADDRESS = 'CurrentEmailAddress'

const createStorageKeyWithSubAddress = (key: string, myAddress: string) => {
  const subsocialAddress = toSubsocialAddress(myAddress)
  if (!subsocialAddress) throw new Error('Unable to define subsocial address')
  return createStorageKey(key, subsocialAddress)
}

const setCurrentEmailAddress = (currentEmail: string) =>
  store.set(CURRENT_EMAIL_ADDRESS, currentEmail)

const getCurrentEmailAddress = (): string => store.get(CURRENT_EMAIL_ADDRESS)

const getTempRegisterAccount = (): string | undefined =>
  store.get(createStorageKey(TEMP_REGISTER_ACCOUNT))

const isCurrentSignerAddress = (myAddress: string) =>
  store.get(createStorageKey(SIGNER_ADDRESS_KEY, toSubsocialAddress(myAddress))) === 0
    ? true
    : false
const getProxyAddress = (myAddress: string): string | undefined =>
  store.get(createStorageKeyWithSubAddress(PROXY_ADDRESS_KEY, myAddress))

const getSignerToken = (myAddress: string): string | undefined =>
  store.get(createStorageKeyWithSubAddress(SIGNER_TOKEN_KEY, myAddress))
const getSignerRefreshToken = (myAddress: string): string | undefined =>
  store.get(createStorageKeyWithSubAddress(SIGNER_REFRESH_TOKEN_KEY, myAddress))

const getSecretKeyByAddress = (myAddress: string): string | undefined =>
  store.get(createStorageKeyWithSubAddress(SECRET_KEY, myAddress))

const getSaltByAddress = (myAddress: string): string | undefined =>
  store.get(createStorageKeyWithSubAddress(SALT, myAddress))

export {
  SIGNER_ADDRESS_KEY,
  SIGNER_TOKEN_KEY,
  SIGNER_REFRESH_TOKEN_KEY,
  TEMP_REGISTER_ACCOUNT,
  PROXY_ADDRESS_KEY,
  SECRET_KEY,
  SALT,
  getProxyAddress,
  getSignerToken,
  getSignerRefreshToken,
  getTempRegisterAccount,
  isCurrentSignerAddress,
  getSecretKeyByAddress,
  getSaltByAddress,
  setCurrentEmailAddress,
  getCurrentEmailAddress,
}
