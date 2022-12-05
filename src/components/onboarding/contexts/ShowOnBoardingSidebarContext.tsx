import { createContext, useContext } from 'react'
import useExternalStorage from 'src/hooks/useExternalStorage'

export interface ShowOnBoardingSidebarContextState {
  showOnBoardingSidebar: boolean | undefined
  setShowOnBoardingSidebar: (show: boolean | undefined) => void
}
export const ShowOnBoardingSidebarContext = createContext<ShowOnBoardingSidebarContextState>({
  showOnBoardingSidebar: false,
  setShowOnBoardingSidebar: () => undefined,
})

const HIDE_ONBOARDING_SIDEBAR_STORAGE_KEY = 'hideOnBoardingSidebar'
export function ShowOnBoardingSidebarProvider({ children }: { children: any }) {
  const { data: showOnBoardingSidebar, setData: setShowOnBoardingSidebar } = useExternalStorage(
    HIDE_ONBOARDING_SIDEBAR_STORAGE_KEY,
    {
      parseStorageToState: data => data !== '1',
      parseStateToStorage: state => (state ? undefined : '1'),
      storageKeyType: 'user',
    },
  )

  return (
    <ShowOnBoardingSidebarContext.Provider
      value={{ showOnBoardingSidebar, setShowOnBoardingSidebar }}
    >
      {children}
    </ShowOnBoardingSidebarContext.Provider>
  )
}

export function useShowOnBoardingSidebarContext() {
  return useContext(ShowOnBoardingSidebarContext)
}
