import {
  DislikeOutlined,
  HomeOutlined,
  LikeOutlined,
  MessageOutlined,
  ShareAltOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons'
import { ReactionType } from '@subsocial/api/types'
import { nonEmptyStr } from '@subsocial/utils'
import { summarize } from '@subsocial/utils/summarize'
import Link from 'next/link'
import React from 'react'
import { NAME_MAX_LEN } from 'src/config/ValidationsConfig'
import messages from 'src/messages'
import { useSelectPost, useSelectProfile, useSelectSpace } from 'src/rtk/app/hooks'
import { Activity, asCommentData, asSharedPostStruct, EventsName, PostData } from 'src/types'
import { ReactionKind } from 'src/types/graphql-global-types'
import { useMyAddress } from '../auth/MyAccountsContext'
import ViewPostLink from '../posts/ViewPostLink'
import Avatar from '../profiles/address-views/Avatar'
import Name from '../profiles/address-views/Name'
import { ViewSpace } from '../spaces/ViewSpace'
import { equalAddresses } from '../substrate'
import { accountUrl, postUrl, spaceUrl } from '../urls'
import { formatDate } from '../utils'
import { DfBgImageLink } from '../utils/DfBgImg'
import { MutedDiv } from '../utils/MutedText'
import { Pluralize } from '../utils/Plularize'
import { NotifActivitiesType } from './Notifications'
import { EventsMsg, PathLinks } from './types'

type NotificationMessageProps = {
  msg: string
  aggregationCount: number
  withAggregation?: boolean
}

type PostTitleForActivityProps = {
  post: PostData
}
const PostTitleForActivity = React.memo(({ post: { content } }: PostTitleForActivityProps) => {
  const noContentText = 'link'
  if (!content) return <>{noContentText}</>

  const { title, summary } = content

  const summarizedContent = title || summarize(summary, { limit: NAME_MAX_LEN })
  return <>{summarizedContent || noContentText}</>
})

const NotificationMessage = ({
  msg,
  aggregationCount,
  withAggregation = true,
}: NotificationMessageProps) => {
  const aggCount = aggregationCount - 1
  const aggregationMsg = withAggregation
    ? aggCount > 0 && (
        <>
          {' and '}
          <Pluralize count={aggCount} singularText='other person' pluralText='other people' />
        </>
      )
    : undefined

  return (
    <>
      {aggregationMsg} {msg}&nbsp;
    </>
  )
}

type NotificationProps = Activity & {
  type: NotifActivitiesType
}

type InnerNotificationProps = NotificationProps &
  PathLinks & {
    preview: React.ReactNode
    entityOwner?: string
    msg?: string
    image?: string
    icon?: React.ReactNode
  }

const iconProps = {
  className: 'DfNotificationIcon',
}

const iconByEvent: Record<string, React.ReactNode> = {
  AccountFollowed: <UserAddOutlined {...iconProps} />,
  SpaceFollowed: <UserAddOutlined {...iconProps} />,
  AccountUnfollowed: <UserDeleteOutlined {...iconProps} />,
  SpaceUnfollowed: <UserDeleteOutlined {...iconProps} />,
  SpaceCreated: <HomeOutlined {...iconProps} />,
  PostCreated: <ShareAltOutlined {...iconProps} />,
  CommentCreated: <MessageOutlined {...iconProps} />,
  CommentReplyCreated: <MessageOutlined {...iconProps} />,
  PostShared: <ShareAltOutlined {...iconProps} />,
  CommentShared: <ShareAltOutlined {...iconProps} />,
  CommentReplyShared: <ShareAltOutlined {...iconProps} />,

  Upvote: <LikeOutlined {...iconProps} />,
  Downvote: <DislikeOutlined {...iconProps} />,
}

export function InnerNotification(props: InnerNotificationProps) {
  const myAddress = useMyAddress()
  const {
    preview,
    entityOwner,
    type,
    image = '',
    links,
    msg: customMsg,
    aggCount,
    event,
    account,
    date,
    icon: _icon,
  } = props
  const owner = useSelectProfile(account.toString())

  const avatar = owner?.content?.image

  const msgType: NotifActivitiesType = equalAddresses(myAddress, entityOwner) ? type : 'activities'

  const eventMsg = messages[msgType] as EventsMsg

  const icon = _icon ?? iconByEvent[event]

  return (
    <Link {...links}>
      <div className='DfNotificationItem'>
        <div className='DfNotificationIcons'>
          {icon}
          <Avatar address={account} avatar={avatar} />
        </div>
        <div className='DfNotificationContent'>
          <div className='DfTextActivity'>
            <Name owner={owner} address={account} />
            <span className='DfActivityMsg'>
              <NotificationMessage
                msg={customMsg || eventMsg[event] || 'Unknown event'}
                aggregationCount={aggCount}
                withAggregation={msgType === 'notifications'}
              />
              {preview}
            </span>
          </div>
          <MutedDiv className='DfDate'>{formatDate(date)}</MutedDiv>
        </div>
        {nonEmptyStr(image) && <DfBgImageLink {...links} src={image} size={80} />}
      </div>
    </Link>
  )
}

const SpaceNotification = (props: NotificationProps) => {
  const { spaceId } = props
  const space = useSelectSpace(spaceId)

  if (!space) return null

  return (
    <InnerNotification
      preview={<ViewSpace spaceData={space} nameOnly withLink />}
      image={space.content?.image}
      entityOwner={space.struct.ownerId}
      links={{
        href: '/[spaceId]',
        as: spaceUrl(space.struct),
      }}
      {...props}
    />
  )
}

const AccountNotification = (props: NotificationProps) => {
  const { followingId } = props
  const profile = useSelectProfile(followingId)

  if (!followingId) return null

  const address = followingId
  return (
    <InnerNotification
      preview={<Name owner={profile} address={address} />}
      image={profile?.content?.image}
      entityOwner={address}
      links={{
        href: '/[spaceId]',
        as: accountUrl({ address }),
      }}
      {...props}
    />
  )
}

const PostNotification = (props: NotificationProps) => {
  const { postId, event } = props
  const postDetails = useSelectPost(postId)

  let originalPostId = ''
  if (postDetails && postDetails.post.struct.isSharedPost) {
    const sharedPost = asSharedPostStruct(postDetails?.post.struct)
    originalPostId = sharedPost.originalPostId
  }
  const sharedPostOriginal = useSelectPost(originalPostId)

  if (!postDetails) return null

  const { post } = postDetails
  const { isSharedPost } = post.struct

  let space = postDetails.space!
  let msg: string | undefined = undefined
  let content = post.content

  const links = {
    href: '/[spaceId]/[slug]',
    as: postUrl(space!, post),
  }

  if (isSharedPost && sharedPostOriginal && event === 'PostCreated') {
    msg = messages['activities'].PostSharing
    const originalPost = sharedPostOriginal?.post
    space = sharedPostOriginal.space!
    content = originalPost.content
    links.as = postUrl(space, originalPost)
  }

  return (
    <InnerNotification
      preview={
        <ViewPostLink
          post={post}
          space={space?.struct}
          title={<PostTitleForActivity post={post} />}
        />
      }
      image={content?.image}
      entityOwner={post.struct.ownerId}
      msg={msg}
      links={links}
      {...props}
    />
  )
}

const CommentNotification = (props: NotificationProps) => {
  const { commentId } = props
  const commentDetails = useSelectPost(commentId)

  const rootPostId = commentDetails
    ? asCommentData(commentDetails.post)?.struct?.rootPostId
    : undefined
  const postDetails = useSelectPost(rootPostId)

  if (!postDetails) return null

  const { post, space } = postDetails

  const links = {
    href: '/[spaceId]/[slug]',
    as: postUrl(space!, post),
  }

  return (
    <InnerNotification
      preview={
        <ViewPostLink
          post={post}
          space={space?.struct}
          title={<PostTitleForActivity post={post} />}
        />
      }
      image={post.content?.image}
      entityOwner={post.struct.ownerId}
      links={links}
      {...props}
    />
  )
}

const reactionWordingMap = {
  ReactionCreated: {
    Upvote: 'upvoted',
    Downvote: 'downvoted',
  },
  ReactionDeleted: {
    Upvote: 'removed upvote',
    Downvote: 'removed downvote',
  },
}
function getReactionType(
  event: EventsName,
  reactionKind: ReactionType | undefined,
  type: NotifActivitiesType = 'activities',
) {
  let reactionType: keyof typeof reactionWordingMap
  if (event.endsWith('ReactionDeleted')) {
    reactionType = 'ReactionDeleted'
  } else {
    reactionType = 'ReactionCreated'
  }
  const kind = reactionKind || ReactionKind.Upvote
  const entity = event.startsWith('Post') ? 'post' : 'comment on'
  const suffix = type === 'activities' ? `the ${entity}` : `your ${entity}`
  return {
    wording: `${reactionWordingMap[reactionType][kind]} ${suffix}`,
    icon: iconByEvent[kind],
  }
}
const PostReactionNotification = (props: NotificationProps) => {
  const { postId, reactionKind, event, type } = props
  const postDetails = useSelectPost(postId)

  if (!postDetails) return null

  const { post } = postDetails

  let space = postDetails.space!

  const { wording: msg, icon } = getReactionType(event, reactionKind, type)
  let content = post.content

  const links = {
    href: '/[spaceId]/[slug]',
    as: postUrl(space, post),
  }

  return (
    <InnerNotification
      preview={
        <ViewPostLink
          post={post}
          space={space?.struct}
          title={<PostTitleForActivity post={post} />}
        />
      }
      icon={icon}
      image={content?.image}
      entityOwner={post.struct.ownerId}
      msg={msg}
      links={links}
      {...props}
    />
  )
}

const CommentReactionNotification = (props: NotificationProps) => {
  const { commentId, event, reactionKind, type } = props
  const commentDetails = useSelectPost(commentId)

  const rootPostId = commentDetails
    ? asCommentData(commentDetails.post)?.struct?.rootPostId
    : undefined
  const postDetails = useSelectPost(rootPostId)

  if (!postDetails) return null

  const { post, space } = postDetails

  const links = {
    href: '/[spaceId]/[slug]',
    as: postUrl(space!, post),
  }

  const { wording: msg, icon } = getReactionType(event, reactionKind, type)

  return (
    <InnerNotification
      preview={
        <ViewPostLink
          post={post}
          space={space?.struct}
          title={<PostTitleForActivity post={post} />}
        />
      }
      msg={msg}
      icon={icon}
      image={post.content?.image}
      entityOwner={post.struct.ownerId}
      links={links}
      {...props}
    />
  )
}

export const Notification = React.memo((props: NotificationProps) => {
  const { event } = props
  const eventName = event

  switch (eventName) {
    case 'AccountFollowed':
    case 'AccountUnfollowed':
      return <AccountNotification {...props} />
    case 'SpaceFollowed':
    case 'SpaceUnfollowed':
      return <SpaceNotification {...props} />
    case 'SpaceCreated':
      return <SpaceNotification {...props} />
    case 'CommentCreated':
      return <CommentNotification {...props} />
    case 'CommentReplyCreated':
      return <CommentNotification {...props} />
    case 'PostShared':
    case 'CommentShared':
    case 'CommentReplyShared':
      return <PostNotification {...props} />
    case 'PostReactionCreated':
    case 'PostReactionUpdated':
    case 'PostReactionDeleted':
      return <PostReactionNotification {...props} />
    case 'CommentReactionCreated':
    case 'CommentReactionUpdated':
    case 'CommentReactionDeleted':
    case 'CommentReplyReactionCreated':
    case 'CommentReplyReactionUpdated':
    case 'CommentReplyReactionDeleted':
      return <CommentReactionNotification {...props} />
    case 'PostCreated':
      return <PostNotification {...props} />
    default:
      return null
  }
})

export default Notification
