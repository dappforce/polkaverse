// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

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
