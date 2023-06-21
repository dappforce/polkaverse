// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { createContext, useContext } from 'react'
import { SIGNER_PROXY_ADDED } from 'src/components/utils/OffchainSigner/ExternalStorage'
import useExternalStorage from 'src/hooks/useExternalStorage'

interface IsProxyAddedContextState {
  isProxyAdded: boolean | undefined
  setIsProxyAdded: (isProxyAdded: boolean | undefined) => void
}
export const IsProxyAddedContext = createContext<IsProxyAddedContextState>({
  isProxyAdded: false,
  setIsProxyAdded: () => undefined,
})

export function IsProxyAddedProvider({ children }: { children: any }) {
  const { data: isProxyAdded, setData: setIsProxyAdded } = useExternalStorage(SIGNER_PROXY_ADDED, {
    parseStorageToState: data => data === '1',
    parseStateToStorage: state => (state ? '1' : undefined),
    storageKeyType: 'user',
    subscribe: true,
  })

  return (
    <IsProxyAddedContext.Provider value={{ isProxyAdded, setIsProxyAdded }}>
      {children}
    </IsProxyAddedContext.Provider>
  )
}

export function useIsProxyAddedContext() {
  return useContext(IsProxyAddedContext)
}
