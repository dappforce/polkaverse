// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { createContext, useContext } from 'react'
import { useBooleanExternalStorage } from 'src/hooks/useExternalStorage'

export interface IsOnBoardingSkippedContextState {
  isOnBoardingSkipped: boolean | undefined
  setIsOnBoardingSkipped: (show: boolean | undefined) => void
}
export const IsOnBoardingSkippedContext = createContext<IsOnBoardingSkippedContextState>({
  isOnBoardingSkipped: false,
  setIsOnBoardingSkipped: () => undefined,
})

const ON_BOARDING_SKIPPED_KEY = 'onBoardingModalSkipped'
export function IsOnBoardingSkippedProvider({ children }: { children: any }) {
  const { data: isOnBoardingSkipped, setData: setIsOnBoardingSkipped } = useBooleanExternalStorage(
    ON_BOARDING_SKIPPED_KEY,
    {
      storageKeyType: 'user',
    },
  )

  return (
    <IsOnBoardingSkippedContext.Provider value={{ isOnBoardingSkipped, setIsOnBoardingSkipped }}>
      {children}
    </IsOnBoardingSkippedContext.Provider>
  )
}

export function useIsOnBoardingSkippedContext() {
  return useContext(IsOnBoardingSkippedContext)
}
