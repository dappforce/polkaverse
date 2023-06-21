// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { createContext, useContext } from 'react'
import { useBooleanExternalStorage } from 'src/hooks/useExternalStorage'

export interface IsFollowSpaceModalUsedContextState {
  isFollowSpaceModalUsed: boolean | undefined
  setIsFollowSpaceModalUsed: (show: boolean | undefined) => void
}
export const IsFollowSpaceModalUsedContext = createContext<IsFollowSpaceModalUsedContextState>({
  isFollowSpaceModalUsed: false,
  setIsFollowSpaceModalUsed: () => undefined,
})

const ON_BOARDING_SKIPPED_KEY = 'isFollowSpaceModalUsed'
export function IsFollowSpaceModalUsedProvider({ children }: { children: any }) {
  const { data: isFollowSpaceModalUsed, setData: setIsFollowSpaceModalUsed } =
    useBooleanExternalStorage(ON_BOARDING_SKIPPED_KEY, {
      storageKeyType: 'user',
    })

  return (
    <IsFollowSpaceModalUsedContext.Provider
      value={{ isFollowSpaceModalUsed, setIsFollowSpaceModalUsed }}
    >
      {children}
    </IsFollowSpaceModalUsedContext.Provider>
  )
}

export function useIsFollowSpaceModalUsedContext() {
  return useContext(IsFollowSpaceModalUsedContext)
}
