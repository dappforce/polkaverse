// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useActions } from 'src/rtk/app/helpers'
import { useAppSelector } from 'src/rtk/app/store'
import { asCommentStruct, PostId, PostStruct, PostWithSomeDetails } from 'src/types'
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
