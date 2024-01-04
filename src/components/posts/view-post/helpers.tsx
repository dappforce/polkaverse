import { BN } from '@polkadot/util'
import { PostId } from '@subsocial/api/types/substrate'
import { isEmptyObj, isEmptyStr } from '@subsocial/utils'
import { Alert, Image, Tooltip } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import isEmpty from 'lodash.isempty'
import Error from 'next/error'
import React, { FC, useEffect, useState } from 'react'
import { useIsMobileWidthOrDevice } from 'src/components/responsive'
import { useIsMySpace } from 'src/components/spaces/helpers'
import { HasDataForSlug } from 'src/components/urls'
import { DfMd } from 'src/components/utils/DfMd'
import NoData from 'src/components/utils/EmptyList'
import { EntityStatusProps, HiddenEntityPanel } from 'src/components/utils/EntityStatusPanels'
import Segment from 'src/components/utils/Segment'
import { ActiveVoters, PostVoters } from 'src/components/voting/ListVoters'
import SuperLike from 'src/components/voting/SuperLike'
import { maintenanceMsg } from 'src/config/env'
import { resolveIpfsUrl } from 'src/ipfs'
import messages from 'src/messages'
import { isBlockedPost } from 'src/moderation'
import { useHasUserASpacePermission } from 'src/permissions/checkPermission'
import { useCanPostSuperLiked } from 'src/rtk/features/activeStaking/hooks'
import {
  PostContent as PostContentType,
  PostData,
  PostStruct,
  PostWithSomeDetails,
  SpaceData,
  SpaceStruct,
} from 'src/types'
import { getTimeRelativeToNow } from 'src/utils/date'
import { RegularPreview } from '.'
import { useSelectSpace } from '../../../rtk/features/spaces/spacesHooks'
import { useIsMyAddress } from '../../auth/MyAccountsContext'
import AuthorPreview from '../../profiles/address-views/AuthorPreview'
import { SpaceNameAsLink } from '../../spaces/ViewSpace'
import { formatDate, isHidden, toShortUrl, useIsVisible } from '../../utils'
import { SummarizeMd } from '../../utils/md/SummarizeMd'
import ViewTags from '../../utils/ViewTags'
import Embed from '../embed/Embed'
import ViewPostLink from '../ViewPostLink'
import { PostDropDownMenu } from './PostDropDownMenu'
import TwitterPost from './TwitterPost'

type IsUnlistedPostProps = {
  post?: PostStruct
  space?: SpaceStruct
}

export const useIsUnlistedPost = ({ post, space }: IsUnlistedPostProps) => {
  const notMyPost = !useIsMyAddress(post?.ownerId)
  const notMySpace = !useIsMySpace(space)
  const canNotHidePosts = !useHasUserASpacePermission({ space, permission: 'UpdateAnyPost' })

  return (
    notMyPost && notMySpace && canNotHidePosts && (isHidden(post) || (post && isBlockedPost(post)))
  )
}

type ReactionModalProps = {
  postId: PostId | BN
}

export const ReactionModal = ({ postId }: ReactionModalProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <span onClick={() => setOpen(true)}>View reactions</span>
      <PostVoters id={postId} active={ActiveVoters.All} open={open} close={() => setOpen(false)} />
    </>
  )
}

type HiddenPostAlertProps = EntityStatusProps & {
  post: PostStruct
  space?: SpaceStruct
}

export const HiddenPostAlert = (props: HiddenPostAlertProps) => {
  const { post, space } = props
  const kind = post.isComment ? 'comment' : 'post'
  const PostAlert = () => <HiddenEntityPanel struct={post} kind={kind} {...props} />

  return space && isHidden(space) ? (
    <HiddenEntityPanel
      struct={space}
      kind='space'
      {...props}
      desc='This post is not visible because its space is hidden.'
    />
  ) : (
    <PostAlert />
  )
}

type BlackPostLinkProps = {
  space: SpaceStruct
  post: HasDataForSlug
  title?: string
}

const BlackPostLink = ({ space, post, title }: BlackPostLinkProps) => (
  <ViewPostLink space={space} post={post} title={title} className='DfBlackLink' />
)

type PostNameProps = {
  post: PostWithSomeDetails
  withLink?: boolean
}

export const PostName: FC<PostNameProps> = React.memo(({ post: postDetails, withLink }) => {
  const { space, post } = postDetails
  const { content: { title } = {} } = post

  if (!post.struct || !space || isEmptyStr(title)) return null

  return (
    <div className={'header DfPostTitle--preview'}>
      {withLink ? <BlackPostLink space={space.struct} post={post} title={title} /> : title}
    </div>
  )
})

type PostCreatorProps = {
  postDetails: PostWithSomeDetails
  withSpaceName: boolean
  withSpaceAvatar?: boolean
  space?: SpaceData
  size?: number
}

export const PostCreator: FC<PostCreatorProps> = ({
  postDetails,
  size,
  withSpaceName,
  withSpaceAvatar,
  space,
}) => {
  const { post } = postDetails || {}
  const {
    struct: { createdAtTime, ownerId, spaceId },
  } = post

  const owner = useSelectSpace()

  if (isEmpty(postDetails.post)) return null

  return (
    <AuthorPreview
      spaceId={withSpaceAvatar ? spaceId : undefined}
      address={ownerId}
      owner={owner}
      withFollowButton
      isShort={true}
      isPadded={false}
      size={size}
      details={
        <div>
          {withSpaceName && space && (
            <>
              <SpaceNameAsLink space={space} className='DfGreyLink' />
              {' • '}
            </>
          )}
          <ViewPostLink
            className='DfGreyLink'
            post={post}
            space={space?.struct}
            title={
              <Tooltip title={formatDate(createdAtTime)}>
                {getTimeRelativeToNow(createdAtTime)}
              </Tooltip>
            }
          />
        </div>
      }
    />
  )
}

export type PostImageProps = {
  content: PostContentType | undefined
  className?: string
  withPreview?: boolean
}

export const PostImage = React.memo(
  ({ content, className, withPreview = true }: PostImageProps) => {
    const image = content?.image
    const [shouldImageBeCropped, setShouldImageBeCropped] = useState(true)

    if (!image || isEmptyStr(image)) return null

    const onImgLoad = (e: any) => {
      const img = e.target as HTMLImageElement
      const { naturalHeight, naturalWidth } = img
      const isTallerThan16By9 = naturalWidth / naturalHeight < 16 / 9
      setShouldImageBeCropped(isTallerThan16By9)
    }

    const wrapperClassName = clsx(className, {
      DfPostImagePreviewWrapperCropped: shouldImageBeCropped,
      DfPostImagePreviewWrapper: true,
    })
    return (
      <Image
        src={resolveIpfsUrl(image)}
        className='DfPostImagePreview'
        preview={withPreview ? { mask: null } : false}
        wrapperClassName={wrapperClassName}
        onLoad={onImgLoad}
      />
    )
  },
)

type PostSummaryProps = {
  space?: SpaceStruct
  post: PostData
}

const PostSummary = React.memo(({ space, post }: PostSummaryProps) => {
  const { content } = post
  if (!content) return null

  const seeMoreLink = <BlackPostLink space={space!} post={post} title='View Post' />
  return <SummarizeMd content={content} more={seeMoreLink} />
})

type PostContentProps = {
  postDetails: PostWithSomeDetails
  space?: SpaceStruct
  withImage?: boolean
  withMarginForCardType?: boolean
}

type PostContentMemoizedProps = PostContentProps & {
  isMobile: boolean
}

const PostContentMemoized = React.memo((props: PostContentMemoizedProps) => {
  const { postDetails, space, withImage, withMarginForCardType } = props

  if (!postDetails) return null

  const { post } = postDetails
  const { content } = post

  if (!content || isEmptyObj(content)) return null
  if (content.tweet?.id) {
    return (
      <div className={clsx(withMarginForCardType && 'mb-3 pb-1')}>
        <TwitterPost withLinkToDetailPage space={space} post={post} className={clsx('my-3')} />
      </div>
    )
  }

  return (
    <div className='DfContent'>
      <ViewPostLink
        post={post}
        space={space}
        title={
          <div>
            {withImage && <PostImage content={post.content} withPreview={false} />}
            <PostName post={postDetails} withLink />
            <PostSummary space={space} post={post} />
          </div>
        }
      />
    </div>
  )
})

export const PostContent = (props: PostContentProps) => {
  const isMobile = useIsMobileWidthOrDevice()
  return <PostContentMemoized isMobile={isMobile} {...props} />
}

type PostActionsPanelProps = {
  postDetails: PostWithSomeDetails
  space?: SpaceStruct
  toogleCommentSection?: () => void
  withBorder?: boolean
  className?: string
}

export const PostActionsPanel: FC<PostActionsPanelProps> = props => {
  const { postDetails, /* space, */ withBorder, className } = props
  const {
    post: { struct },
  } = postDetails

  const clientCanPostSuperLiked = useClientValidationOfPostSuperLike(struct.createdAtTime)
  const canPostSuperLiked = useCanPostSuperLiked(struct.id)
  if (!canPostSuperLiked || !clientCanPostSuperLiked) return null

  const ReactionsAction = () => <SuperLike post={struct} />

  return (
    <div className={`DfActionsPanel ${withBorder && 'DfActionBorder'} ${className ?? ''}`}>
      <ReactionsAction />
      {/* <ShareDropdown postDetails={postDetails} space={space} className='DfAction' /> */}
    </div>
  )
}

function useClientValidationOfPostSuperLike(createdAtTime: number) {
  const [, setState] = useState({})

  useEffect(() => {
    const interval = setInterval(() => setState({}), 5 * 1000 * 60) // refresh every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const isPostMadeMoreThan1WeekAgo = dayjs().diff(dayjs(createdAtTime), 'day') > 7
  return !isPostMadeMoreThan1WeekAgo
}

type PostPreviewProps = {
  postDetails: PostWithSomeDetails
  space?: SpaceData
  withImage?: boolean
  withTags?: boolean
  withMarginForCardType?: boolean
}

const SharedPostMd = (props: PostPreviewProps) => {
  const {
    postDetails: { post },
    space,
  } = props
  const { struct, content } = post

  return struct.isComment ? (
    <DfMd source={content?.body} className='DfPostBody' />
  ) : (
    <PostSummary space={space?.struct} post={post} />
  )
}

export const SharePostContent = (props: PostPreviewProps) => {
  const {
    postDetails: { ext },
  } = props

  const OriginalPost = () => {
    const originalPost = ext?.post.struct

    const isVisiblePost = useIsVisible({ struct: originalPost })
    const postDetails = ext as PostWithSomeDetails

    return isVisiblePost ? (
      <RegularPreview postDetails={postDetails} space={postDetails?.space} />
    ) : (
      <PostNotFound />
    )
  }

  const summary = props.postDetails.post.content?.summary

  return (
    <div className='DfSharedSummary'>
      <SharedPostMd {...props} />
      <Segment className={clsx('DfPostPreview', summary && 'mt-3')}>
        <OriginalPost />
      </Segment>
    </div>
  )
}

export const InfoPostPreview: FC<PostPreviewProps> = props => {
  const { postDetails, space, withImage = true, withTags, withMarginForCardType } = props
  const {
    post: { struct, content },
  } = postDetails
  const isMobile = useIsMobileWidthOrDevice()

  if (!struct || !content) return null

  return (
    <div className='DfInfo'>
      <div className='DfRow'>
        <div className='w-100'>
          <div className='DfRow'>
            <PostCreator postDetails={postDetails} space={space} withSpaceName withSpaceAvatar />
            <PostDropDownMenu
              post={postDetails.post}
              space={space?.struct}
              withEditButton={!isMobile}
            />
          </div>
          {content.link && <Embed link={content.link} className='mt-3' />}
          <PostContent
            withMarginForCardType={withMarginForCardType && !withTags}
            postDetails={postDetails}
            space={space?.struct}
            withImage={withImage}
          />
          {withTags && <ViewTags tags={content?.tags} />}
          {/* {withStats && <StatsPanel id={post.id}/>} */}
        </div>
        {/* {!isMobile && withImage && <PostImage post={postDetails.post} space={space?.struct} />} */}
      </div>
    </div>
  )
}

type OriginalPostPanelProps = {
  canonicalUrl?: string
}

export const OriginalPostPanel = ({ canonicalUrl }: OriginalPostPanelProps) => {
  if (!canonicalUrl || isEmptyStr(canonicalUrl)) return null

  const shortUrl = toShortUrl(canonicalUrl)
  const message = (
    <span className='FontNormal'>
      {messages.postPage.originalPost}{' '}
      <a href={canonicalUrl} rel='noreferrer npofollow'>
        {shortUrl}
      </a>
    </span>
  )

  return <Alert type='info' message={message} className='my-4' />
}

export const PostNotFound = () => <NoData description='Post not found' />
export const PostNotFoundPage = () => <Error statusCode={404} title='Post not found' />
export const MaintenancePage = () => (
  <Error statusCode={503} title={maintenanceMsg || messages.errors.maintenance} />
)
