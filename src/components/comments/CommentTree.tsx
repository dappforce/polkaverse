import React, { FC, useMemo, useState } from 'react'
import { useSelectSpace } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/store'
import { useSelectPost } from 'src/rtk/features/posts/postsHooks'
import { fetchPostReplyIds } from 'src/rtk/features/replies/repliesSlice'
import { asCommentStruct, PostId } from 'src/types'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { useMyAddress } from '../auth/MyAccountsContext'
import DataList from '../lists/DataList'
import { Loading } from '../utils'
import { CommentEventProps } from './CommentEditor'
import { useRepliesData } from './utils'
import ViewComment from './ViewComment'

type CommentsTreeProps = {
  parentId: PostId
  eventProps: CommentEventProps
  directlyExpandReplies?: boolean
}

type CommentByIdProps = {
  commentId: PostId
  eventProps: CommentEventProps
  directlyExpandReplies?: boolean
}

const CommentById = React.memo(
  ({ commentId: id, eventProps, directlyExpandReplies }: CommentByIdProps) => {
    const comment = useSelectPost(id)

    const rootPostId = comment ? asCommentStruct(comment.post.struct).rootPostId : undefined
    const rootPost = useSelectPost(rootPostId)?.post.struct
    const space = useSelectSpace(rootPost?.spaceId)?.struct

    if (!comment) return null

    return (
      <ViewComment
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
}) => {
  const dispatch = useAppDispatch()
  const myAddress = useMyAddress()
  const [loading, setLoading] = useState(true)

  const comment = useSelectPost(parentId)
  const repliesCount = comment?.post.struct.repliesCount || 0
  const { replyIds, hasReplies } = useRepliesData({ id: parentId, repliesCount: repliesCount })
  const reversedReplyIds = useMemo(() => {
    return replyIds.slice().reverse()
  }, [replyIds])

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

  return (
    <DataList
      dataSource={reversedReplyIds}
      getKey={replyId => replyId}
      className='mt-2.5'
      listClassName='GapSmall d-flex flex-column'
      renderItem={replyId => (
        <CommentById
          directlyExpandReplies={directlyExpandReplies}
          commentId={replyId}
          eventProps={eventProps}
        />
      )}
    />
  )
}
