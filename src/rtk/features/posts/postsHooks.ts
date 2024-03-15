import { useMemo } from 'react'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import config from 'src/config'
import { useActions } from 'src/rtk/app/helpers'
import { useAppSelector } from 'src/rtk/app/store'
import { asCommentStruct, PostId, PostStruct, PostWithSomeDetails } from 'src/types'
import { selectAllCanPostSuperLiked } from '../activeStaking/canPostSuperLikedSlice'
import { selectPostContentById } from '../contents/contentsSlice'
import { useSelectSpace } from '../spaces/spacesHooks'
import {
  fetchPosts,
  SelectPostArgs,
  selectPostMap,
  SelectPostsArgs,
  selectPostStructById,
  upsertPost,
} from './postsSlice'
import { selectPostViewCount } from './postsViewCountSlice'

export function useIsMuted(address: string) {
  const myAddress = useMyAddress() ?? ''
  const mutedAccounts = config.mutedAccounts?.[myAddress]
  return mutedAccounts?.includes(address) ?? false
}

export const useSelectPost = (
  postId?: PostId,
  showMuted?: boolean,
): PostWithSomeDetails | undefined => {
  const struct = useAppSelector(state => (postId ? selectPostStructById(state, postId) : undefined))
  const isMuted = useIsMuted(struct?.ownerId || '') && !showMuted

  const cid = struct?.contentId
  const content = useAppSelector(state => (cid ? selectPostContentById(state, cid) : undefined))

  const rootPostStruct = useAppSelector(state =>
    struct && struct.isComment
      ? selectPostStructById(state, asCommentStruct(struct).rootPostId)
      : undefined,
  )

  const spaceId = struct?.spaceId || rootPostStruct?.spaceId
  const space = useSelectSpace(spaceId)

  if (!struct || !content || isMuted) return undefined

  const id = struct.id

  const post = {
    id,
    struct,
    content,
  }

  return {
    id,
    post,
    space,
  }
}

// Bad method
// export const useFetchPosts = (args: SelectPostsArgs) => {
//   return useFetchEntities(selectPosts, fetchPosts, args)
// }

export const useCreateReloadPosts = () => {
  return useActions<SelectPostsArgs>(({ dispatch, api, args: { ids } }) =>
    dispatch(fetchPosts({ api, ids: ids, reload: true })),
  )
}

export const useCreateReloadPost = () => {
  return useActions<SelectPostArgs>(({ dispatch, api, args: { id } }) =>
    dispatch(fetchPosts({ api, ids: [id], reload: true })),
  )
}

export const useCreateUpsertPost = () => {
  return useActions<PostStruct>(({ dispatch, args }) => dispatch(upsertPost(args)))
}

export function useFilterLowValuePosts(postIds: string[]) {
  const allData = useAppSelector(state => selectAllCanPostSuperLiked(state))
  const myAddress = useMyAddress() ?? ''
  const postsMap = useAppSelector(state => selectPostMap(state, { ids: postIds }))

  return useMemo(() => {
    let filteredCount = 0
    const filtered = postIds.filter(id => {
      const canPostSuperLiked = allData[id]

      if (postsMap[id]?.post.struct.ownerId === myAddress) return true
      if (!canPostSuperLiked?.isExist) return true

      if (!canPostSuperLiked?.validByLowValue || !canPostSuperLiked?.validByCreatorMinStake) {
        filteredCount++
        return false
      }
      return true
    })

    return { filtered, filteredCount }
  }, [postIds.join(','), myAddress])
}

export function usePostViewCount(postId: string) {
  return useAppSelector(state => selectPostViewCount(state, postId)?.viewsCount ?? 0)
}
