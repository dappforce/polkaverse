import React, { FC, useMemo, useState } from 'react'
import { useSelectSpace } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/store'
import { useFilterLowValuePosts, useSelectPost } from 'src/rtk/features/posts/postsHooks'
import { fetchPostReplyIds } from 'src/rtk/features/replies/repliesSlice'
import { asCommentStruct, PostId } from 'src/types'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { useMyAddress } from '../auth/MyAccountsContext'
import DataList from '../lists/DataList'
import { Loading } from '../utils'
import { MutedSpan } from '../utils/MutedText'
import { CommentEventProps } from './CommentEditor'
import { useRepliesData } from './utils'
import ViewComment from './ViewComment'

type CommentsTreeProps = {
  rootPostId: PostId
  parentId: PostId
  eventProps: CommentEventProps
  directlyExpandReplies?: boolean
  showAllReplies: boolean
}

type CommentByIdProps = {
  commentId: PostId
  eventProps: CommentEventProps
  directlyExpandReplies?: boolean
  showAllReplies: boolean
}

const CommentById = React.memo(
  ({ commentId: id, eventProps, directlyExpandReplies, showAllReplies }: CommentByIdProps) => {
    const comment = useSelectPost(id)

    const rootPostId = comment ? asCommentStruct(comment.post.struct).rootPostId : undefined
    const rootPost = useSelectPost(rootPostId)?.post.struct
    const space = useSelectSpace(rootPost?.spaceId)?.struct

    if (!comment) return null

    return (
      <ViewComment
        showAllReplies={showAllReplies}
        withShowReplies={directlyExpandReplies}
        rootPost={rootPost}
        space={space}
        comment={comment}
        eventProps={eventProps}
      />
    )
  },
)

export const ViewCommentsTree: FC<CommentsTreeProps> = ({
  parentId,
  eventProps,
  directlyExpandReplies,
  showAllReplies,
}) => {
  const dispatch = useAppDispatch()
  const myAddress = useMyAddress()
  const [loading, setLoading] = useState(true)
  const [localShowAllReplies, setLocalShowAllReplies] = useState(false)

  const comment = useSelectPost(parentId)
  const repliesCount = comment?.post.struct.repliesCount || 0
  const { replyIds, hasReplies } = useRepliesData({ id: parentId, repliesCount: repliesCount })
  const reversedReplyIds = useMemo(() => {
    return replyIds.slice().reverse()
  }, [replyIds])

  const { filtered: filteredIds } = useFilterLowValuePosts(reversedReplyIds)
  const usedIds = showAllReplies || localShowAllReplies ? reversedReplyIds : filteredIds

  useSubsocialEffect(
    ({ subsocial }) => {
      if (!repliesCount) return setLoading(false)
      let isMounted = true

      const isOutOfSync = repliesCount > replyIds.length
      dispatch(
        fetchPostReplyIds({
          api: subsocial,
          id: parentId,
          myAddress,
          reload: isOutOfSync,
        }),
      ).then(() => isMounted && setLoading(false))

      return () => {
        isMounted = false
      }
    },
    [parentId, repliesCount],
  )

  if (!comment || !hasReplies) return null

  if (loading) return <Loading label='Loading replies...' center={false} />

  const hasAllRepliesHidden =
    !showAllReplies && filteredIds.length === 0 && reversedReplyIds.length > 0

  return (
    <DataList
      dataSource={usedIds}
      getKey={replyId => replyId}
      className='mt-2.5'
      listClassName='GapSmall d-flex flex-column'
      customNoData={
        hasAllRepliesHidden && (
          <div
            className='d-flex px-3 py-2 RoundedLarge d-flex align-items-center GapNormal justify-content-between mt-1'
            style={{ border: '1px solid #d1d1d1' }}
          >
            <MutedSpan>Show additional replies</MutedSpan>
            <span
              className='FontWeightSemibold CursorPointer'
              onClick={() => setLocalShowAllReplies(true)}
            >
              Show
            </span>
          </div>
        )
      }
      renderItem={replyId => (
        <CommentById
          directlyExpandReplies={directlyExpandReplies}
          showAllReplies={showAllReplies}
          commentId={replyId}
          eventProps={eventProps}
        />
      )}
    />
  )
}
