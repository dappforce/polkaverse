import { createContext, ReactNode, useContext, useMemo } from 'react'
import useLocalStorage from 'use-local-storage'
import { TabKeys } from '../main/types'

const ShowLikeablePostsContext = createContext<{
  value: boolean
  setValue: (value: boolean) => void
}>({
  value: false,
  setValue: () => undefined,
})

export function ShowLikeablePostsProvider({
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
    <ShowLikeablePostsContext.Provider value={memoized}>
      {children}
    </ShowLikeablePostsContext.Provider>
  )
}

export function useShowLikeablePostsContext() {
  return useContext(ShowLikeablePostsContext)
}
