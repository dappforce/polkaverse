import { createContext, ReactNode, useContext, useMemo } from 'react'
import useLocalStorage from 'use-local-storage'
import { TabKeys } from '../main/types'

const ShowActiveStakingPostsContext = createContext<{
  value: boolean
  setValue: (value: boolean) => void
}>({
  value: false,
  setValue: () => undefined,
})

export function ShowActiveStakingPostsProvider({
  children,
  filter,
  tab,
}: {
  children: ReactNode
  tab: TabKeys
  filter: string | undefined
}) {
  let [showActiveStakingPosts, setShowActiveStakingPosts] = useLocalStorage(
    'show-active-staking-posts',
    false,
  )

  if (tab !== 'posts' || filter !== 'latest') {
    showActiveStakingPosts = false
  }

  const memoized = useMemo(
    () => ({
      value: showActiveStakingPosts,
      setValue: setShowActiveStakingPosts,
    }),
    [showActiveStakingPosts],
  )

  return (
    <ShowActiveStakingPostsContext.Provider value={memoized}>
      {children}
    </ShowActiveStakingPostsContext.Provider>
  )
}

export function useShowActiveStakingPostsContext() {
  return useContext(ShowActiveStakingPostsContext)
}
