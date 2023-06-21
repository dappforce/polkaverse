// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { SubsocialIpfsApi } from '@subsocial/api'
import { shallowEqual } from 'react-redux'
import { TxCallback, TxFailedCallback } from 'src/components/substrate/SubstrateTxButton'
import { useAppSelector } from 'src/rtk/app/store'
import { selectReplyIds } from 'src/rtk/features/replies/repliesSlice'
import { CommentContent, IpfsCid, PostContent, PostStruct } from 'src/types'
import { FVoid } from '../utils/types'
// export const useRemoveReplyFromStore = (dispatch: Dispatch, reply: Reply<string>) => {
//   dispatch(removeComment(reply))
//   dispatch(removePost({ postId: reply.replyId }))
// }

// export const useSetReplyToStore = (dispatch: Dispatch, { reply, comment }: SetCommentStore<string | string[]>) => {
//   dispatch(addComments(reply))
//   dispatch(addPost({ posts: comment }))
// }

// export const useChangeReplyToStore = (dispatch: Dispatch, oldReply: Reply<string>, newStore: SetCommentStore<string>) => {
//   useRemoveReplyFromStore(dispatch, oldReply)
//   useSetReplyToStore(dispatch, newStore)
// }

// export const useEditReplyToStore = (dispatch: Dispatch, { replyId, comment }: EditCommentStore) => {
//   dispatch(editPost({ postId: replyId, post: comment }))
// }

type MockComment = {
  fakeId: string
  address: string
}

export type CommentTxButtonType = {
  ipfs: SubsocialIpfsApi
  setIpfsCid: (hash: IpfsCid) => void
  json: CommentContent | PostContent
  fakeId?: string
  disabled?: boolean
  loading?: boolean
  onClick?: FVoid
  onSuccess?: TxCallback
  onFailed?: TxFailedCallback
}

export const buildMockComment = ({ fakeId, address }: MockComment): PostStruct => {
  const id = fakeId

  return {
    id,
    ownerId: address,
    createdByAccount: address,
    createdAtBlock: 0,
    createdAtTime: new Date().getTime(),

    hidden: false,
    contentId: id,
    isRegularPost: false,
    isSharedPost: false,
    isComment: true,

    repliesCount: 0,

    sharesCount: 0,
    upvotesCount: 0,
    downvotesCount: 0,
  }
}

export function useRepliesData({ id, repliesCount }: { id: string; repliesCount?: number }) {
  const { replyIds = [] } = useAppSelector(state => selectReplyIds(state, id), shallowEqual) || {}
  return {
    replyIds,
    hasReplies: repliesCount || replyIds.length > 0,
    replyCountWithFake: Math.max(repliesCount ?? 0, replyIds.length),
  }
}
