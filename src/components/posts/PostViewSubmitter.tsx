import { useEffect } from 'react'
import { POST_VIEW_DURATION } from 'src/config/constants'
import { LocalStorage } from 'src/utils/storage'
import { useMyAddress } from '../auth/MyAccountsContext'
import { addPostViews } from '../utils/datahub/post-view'

const postViewStorage = new LocalStorage(() => 'post-view')
function addPostViewsToStorage(postId: string) {
  const string = postViewStorage.get() ?? ''
  postViewStorage.set(`${string},${postId}`)
}
function getPostViewsFromStorage() {
  const postViewsString = postViewStorage.get()
  if (!postViewsString) return []
  const postViews = postViewsString.split(',').filter(Boolean)
  if (!Array.isArray(postViews)) return []

  const filteredIds = new Set<string>(postViews)
  return Array.from(filteredIds)
}

export function usePostViewTracker(postId: string, sharedPostId?: string, enabled?: boolean) {
  useEffect(() => {
    if (!enabled) return

    const timeoutId = setTimeout(async () => {
      addPostViewsToStorage(postId)
      if (sharedPostId) addPostViewsToStorage(sharedPostId)
    }, POST_VIEW_DURATION)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [enabled])
}

const BATCH_TIMEOUT = 10_000
export default function PostViewSubmitter() {
  const myAddress = useMyAddress()

  useEffect(() => {
    if (!myAddress) return

    const intervalId = setInterval(async () => {
      try {
        const postViews = getPostViewsFromStorage()
        if (!postViews.length) return

        postViewStorage.remove()
        await addPostViews({
          args: {
            views: Array.from(postViews).map(value => ({
              duration: POST_VIEW_DURATION,
              viewerId: myAddress,
              postPersistentId: value,
            })),
          },
        })
      } catch {}
    }, BATCH_TIMEOUT)

    return () => {
      clearTimeout(intervalId)
    }
  }, [myAddress])

  return null
}
