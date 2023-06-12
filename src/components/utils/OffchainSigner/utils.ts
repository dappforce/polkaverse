import { getStoreDispatcher } from 'src/rtk/app/store'
import { signOut } from 'src/rtk/features/accounts/myAccountSlice'
import {
  createStorageKeyWithSubAddress,
  getCurrentEmailAddress,
  SIGNER_ADDRESS_KEY,
  SIGNER_PROXY_ADDED,
  SIGNER_REFRESH_TOKEN_KEY,
  SIGNER_TOKEN_KEY,
} from './ExternalStorage'

export function signOutFromProxy(address: string) {
  localStorage.removeItem(createStorageKeyWithSubAddress(SIGNER_ADDRESS_KEY, address))
  localStorage.removeItem(createStorageKeyWithSubAddress(SIGNER_TOKEN_KEY, address))
  localStorage.removeItem(createStorageKeyWithSubAddress(SIGNER_REFRESH_TOKEN_KEY, address))
  localStorage.removeItem(createStorageKeyWithSubAddress(SIGNER_PROXY_ADDED, address))
  window.dispatchEvent(new Event('storage'))

  const isUsingEmail = !!getCurrentEmailAddress()
  if (isUsingEmail) {
    const dispatch = getStoreDispatcher()
    dispatch?.(signOut())
  }
}
