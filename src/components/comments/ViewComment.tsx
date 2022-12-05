import {
  CaretDownOutlined,
  CaretUpOutlined,
  CommentOutlined,
  NotificationOutlined,
} from '@ant-design/icons'
import { Button, Comment, Tag } from 'antd'
import dayjs from 'dayjs'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'
import {
  asCommentData,
  asCommentStruct,
  CommentContent,
  PostStruct,
  PostWithSomeDetails,
  SpaceStruct,
} from 'src/types'
import { useSelectSpace } from '../../rtk/features/spaces/spacesHooks'
import { ShareDropdown } from '../posts/share/ShareDropdown'
import { PostDropDownMenu } from '../posts/view-post/PostDropDownMenu'
import AuthorPreview from '../profiles/address-views/AuthorPreview'
import { equalAddresses } from '../substrate'
import { postUrl } from '../urls'
import { formatDate, IconWithLabel, useIsHidden } from '../utils'
import { Pluralize } from '../utils/Plularize'
import { VoterButtons } from '../voting/VoterButtons'
import { ViewCommentsTree } from './CommentTree'
import { NewComment } from './CreateComment'
import { CommentBody } from './helpers'
import { EditComment } from './UpdateComment'
import { useRepliesData } from './utils'

const CommentsIcon = <CommentOutlined />

type Props = {
  space?: SpaceStruct
  rootPost?: PostStruct
  comment: PostWithSomeDetails
  withShowReplies?: boolean
}

export const InnerViewComment: FC<Props> = props => {
  const {
    space = { id: 0 } as any as SpaceStruct,
    rootPost,
    comment: commentDetails,
    withShowReplies = false,
  } = props

  const { post: comment } = commentDetails

  const commentStruct = asCommentStruct(comment.struct)
  const commentContent = comment.content as CommentContent
  const { id, createdAtTime, ownerId } = commentStruct

  const owner = useSelectSpace()

  const [showEditForm, setShowEditForm] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)

  const { hasReplies, replyCountWithFake } = useRepliesData(commentStruct)

  const [showReplies, setShowReplies] = useState(withShowReplies && hasReplies)

  useEffect(() => {
    setShowReplies(withShowReplies && hasReplies)
  }, [hasReplies])

  const isFake = id.startsWith('fake')
  const commentLink = postUrl(space, comment)
  const isRootPostOwner = equalAddresses(rootPost?.ownerId, commentStruct.ownerId)

  const ViewRepliesLink = () => {
    const viewActionMessage = showReplies ? (
      <>
        <CaretUpOutlined /> {'Hide'}
      </>
    ) : (
      <>
        <CaretDownOutlined /> {'View'}
      </>
    )

    return (
      <>
        <Link href={commentLink}>
          <a
            onClick={event => {
              event.preventDefault()
              setShowReplies(!showReplies)
            }}
          >
            {viewActionMessage}{' '}
            <Pluralize count={replyCountWithFake || 0} singularText='reply' pluralText='replies' />
          </a>
        </Link>
      </>
    )
  }

  const onEditComment = () => setShowEditForm(true)

  const commentAuthor = (
    <div className='DfAuthorBlock'>
      <AuthorPreview
        address={ownerId}
        owner={owner}
        isShort={true}
        isPadded={false}
        size={32}
        afterName={
          isRootPostOwner ? (
            <Tag color='blue' className='ml-2'>
              <NotificationOutlined className='mr-2' />
              Post author
            </Tag>
          ) : undefined
        }
        details={
          <span>
            <Link href='/[spaceId]/[slug]' as={commentLink}>
              <a className='DfGreyLink' title={formatDate(createdAtTime)}>
                {dayjs(createdAtTime).fromNow()}
              </a>
            </Link>
            {/* {' · '} */}
            {/* {pluralize(score, 'Point')} */}
          </span>
        }
      />
      {!isFake && <PostDropDownMenu post={comment} space={space} onEditComment={onEditComment} />}
    </div>
  )

  const newCommentForm = showReplyForm && (
    <NewComment
      post={commentStruct}
      callback={() => {
        setShowReplyForm(false)
      }}
      withCancel
    />
  )

  const actionCss = 'DfCommentAction'
  const hoverActionCss = `${actionCss} AnimatedVisibility`

  return (
    <div className={isFake ? 'DfDisableLayout pb-3' : ''}>
      <Comment
        className='DfNewComment'
        actions={
          isFake
            ? []
            : [
                <VoterButtons
                  key={`voters-of-comments-${id}`}
                  post={commentStruct}
                  className={actionCss}
                />,
                <Button
                  key={`reply-comment-${id}`}
                  className={hoverActionCss}
                  onClick={() => setShowReplyForm(true)}
                >
                  <IconWithLabel icon={CommentsIcon} label='Reply' />
                </Button>,
                <ShareDropdown
                  key={`dropdown-comment-${id}`}
                  postDetails={commentDetails}
                  space={space}
                  className={hoverActionCss}
                />,
              ]
        }
        author={commentAuthor}
        content={
          showEditForm ? (
            <EditComment
              struct={commentStruct}
              content={commentContent}
              callback={() => setShowEditForm(false)}
            />
          ) : (
            <CommentBody comment={asCommentData(comment)} />
          )
        }
      >
        <div>
          {newCommentForm}
          {hasReplies && (
            <div className='pb-2'>
              {!withShowReplies && <ViewRepliesLink />}
              {showReplies && <ViewCommentsTree parentId={commentStruct.id} />}
            </div>
          )}
        </div>
      </Comment>
    </div>
  )
}

export const ViewComment = (props: Props) => {
  const isHiddenComment = useIsHidden(props.comment.post)
  if (!props.comment || isHiddenComment) return null

  return <InnerViewComment {...props} />
}

export default ViewComment
