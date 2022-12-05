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
