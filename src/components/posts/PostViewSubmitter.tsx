import { useEffect } from 'react'
import { POST_VIEW_DURATION } from 'src/config/constants'
import { LocalStorage } from 'src/utils/storage'
import { useMyAddress } from '../auth/MyAccountsContext'
import { addPostViews } from '../utils/datahub/post-view'

export const postViewStorage = new LocalStorage(() => 'post-view')
const BATCH_TIMEOUT = 10_000
export default function PostViewSubmitter() {
  const myAddress = useMyAddress()

  useEffect(() => {
    if (!myAddress) return

    const intervalId = setInterval(async () => {
      try {
        const postViewsString = postViewStorage.get()
        if (!postViewsString) return
        const postViews = JSON.parse(postViewsString) as string[]
        if (!Array.from(postViews)) return

        const filteredIds = new Set<string>()
        postViews.forEach(id => {
          if (typeof id !== 'string') return
          filteredIds.add(id)
        })

        await addPostViews({
          args: {
            views: Array.from(filteredIds).map(value => ({
              duration: POST_VIEW_DURATION,
              viewerId: myAddress,
              postPersistentId: value,
            })),
          },
        })
        postViewStorage.remove()
      } catch {}
    }, BATCH_TIMEOUT)
    return () => {
      clearTimeout(intervalId)
    }
  }, [myAddress])

  return null
}
