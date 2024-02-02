import { useMemo } from 'react'
import { useActions } from 'src/rtk/app/helpers'
import { useAppSelector } from 'src/rtk/app/store'
import { asCommentStruct, PostId, PostStruct, PostWithSomeDetails } from 'src/types'
import { selectAllCanPostSuperLiked } from '../activeStaking/canPostSuperLikedSlice'
import { selectPostContentById } from '../contents/contentsSlice'
import { useSelectSpace } from '../spaces/spacesHooks'
import {
  fetchPosts,
  SelectPostArgs,
  SelectPostsArgs,
  selectPostStructById,
  upsertPost,
} from './postsSlice'

export const useSelectPost = (postId?: PostId): PostWithSomeDetails | undefined => {
  const struct = useAppSelector(state => (postId ? selectPostStructById(state, postId) : undefined))

  const cid = struct?.contentId
  const content = useAppSelector(state => (cid ? selectPostContentById(state, cid) : undefined))

  const rootPostStruct = useAppSelector(state =>
    struct && struct.isComment
      ? selectPostStructById(state, asCommentStruct(struct).rootPostId)
      : undefined,
  )

  const spaceId = struct?.spaceId || rootPostStruct?.spaceId
  const space = useSelectSpace(spaceId)

  if (!struct || !content) return undefined

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

  return useMemo(() => {
    let filteredCount = 0
    const filtered = postIds.filter(id => {
      const canPostSuperLiked = allData[id]
      if (!canPostSuperLiked?.validByLowValue || !canPostSuperLiked?.validByCreatorMinStake) {
        filteredCount++
        return false
      }
      return true
    })

    return { filtered, filteredCount }
  }, [postIds.join(',')])
}
