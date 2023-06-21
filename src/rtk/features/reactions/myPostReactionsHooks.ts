// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { prependIdWithAddress, useActions } from 'src/rtk/app/helpers'
import { useFetch } from 'src/rtk/app/hooksCommon'
import { PostId, ReactionStruct } from 'src/types'
import { fetchMyReactionsByPostIds, upsertMyReaction } from './myPostReactionsSlice'

export const useFetchMyReactionsByPostId = (postId: PostId) => {
  return useFetchMyReactionsByPostIds([postId])
}

export const useFetchMyReactionsByPostIds = (postIds: PostId[]) => {
  const myAddress = useMyAddress()
  return useFetch(fetchMyReactionsByPostIds, { ids: postIds, myAddress })
}

export const useCreateUpsertMyReaction = () => {
  const myAddress = useMyAddress()
  return useActions<ReactionStruct>(({ dispatch, args: { id: postId, reactionId, kind } }) => {
    myAddress &&
      dispatch(
        upsertMyReaction({
          id: prependIdWithAddress(postId, myAddress),
          reactionId,
          kind,
        }),
      )
  })
}
