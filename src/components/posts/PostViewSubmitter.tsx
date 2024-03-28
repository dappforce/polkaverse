import { useEffect } from 'react'
import { POST_VIEW_DURATION } from 'src/config/constants'
import { LocalStorage } from 'src/utils/storage'
import { useMyAddress } from '../auth/MyAccountsContext'
import { addPostViews } from '../utils/datahub/post-view'

export const postViewStorage = new LocalStorage(() => 'post-view')
export function getPostViewsFromStorage() {
  try {
    const postViewsString = postViewStorage.get()
    if (!postViewsString) return []
    const postViews = JSON.parse(postViewsString) as string[]
    if (!Array.isArray(postViews)) return []

    const filteredIds = new Set<string>()
    postViews.forEach(id => {
      if (typeof id !== 'string') return
      filteredIds.add(id)
    })

    return postViews
  } catch {
    postViewStorage.remove()
  }
  return []
}

export function usePostViewTracker(postId: string, sharedPostId?: string, enabled?: boolean) {
  useEffect(() => {
    if (!enabled) return

    const timeoutId = setTimeout(async () => {
      const postViews = getPostViewsFromStorage()
      const viewsSet = new Set(postViews)
      viewsSet.add(postId)
      if (sharedPostId) {
        viewsSet.add(sharedPostId)
      }

      postViewStorage.set(JSON.stringify(Array.from(viewsSet)))
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
