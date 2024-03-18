import { BN } from '@polkadot/util'
import { PostId } from '@subsocial/api/types/substrate'
import { isEmptyObj, isEmptyStr } from '@subsocial/utils'
import { Alert, Button, Image, Tag, Tooltip } from 'antd'
import clsx from 'clsx'
import isEmpty from 'lodash.isempty'
import Error from 'next/error'
import React, { FC, useState } from 'react'
import { RiPushpin2Fill } from 'react-icons/ri'
import { TbCoins, TbMessageCircle2 } from 'react-icons/tb'
import CustomLink from 'src/components/referral/CustomLink'
import { useIsMobileWidthOrDevice } from 'src/components/responsive'
import { useIsMySpace } from 'src/components/spaces/helpers'
import SpacePreviewPopup from 'src/components/spaces/SpacePreviewPopup'
import { HasDataForSlug } from 'src/components/urls'
import NoData from 'src/components/utils/EmptyList'
import { EntityStatusProps, HiddenEntityPanel } from 'src/components/utils/EntityStatusPanels'
import FollowSpaceButton from 'src/components/utils/FollowSpaceButton'
import Segment from 'src/components/utils/Segment'
import { ActiveVoters, PostVoters } from 'src/components/voting/ListVoters'
import SuperLike from 'src/components/voting/SuperLike'
import { resolveIpfsUrl } from 'src/ipfs'
import messages from 'src/messages'
import { isBlockedPost } from 'src/moderation'
import { useHasUserASpacePermission } from 'src/permissions/checkPermission'
import { useCanPostSuperLiked } from 'src/rtk/features/activeStaking/hooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import {
  PostContent as PostContentType,
  PostData,
  PostStruct,
  PostWithSomeDetails,
  SpaceData,
  SpaceStruct,
} from 'src/types'
import { getTimeRelativeToNow } from 'src/utils/date'
import { getContentStakingLink } from 'src/utils/links'
import { RegularPreview } from '.'
import { useSelectSpace } from '../../../rtk/features/spaces/spacesHooks'
import { useIsMyAddress, useMyAddress } from '../../auth/MyAccountsContext'
import AuthorPreview from '../../profiles/address-views/AuthorPreview'
import { SpaceNameAsLink } from '../../spaces/ViewSpace'
import { formatDate, isHidden, toShortUrl, useIsVisible } from '../../utils'
import { SummarizeMd } from '../../utils/md/SummarizeMd'
import ViewTags from '../../utils/ViewTags'
import Embed, { getEmbedLinkType } from '../embed/Embed'
import { isPinnedPost } from '../pinned-post'
import { ShareDropdown } from '../share/ShareDropdown'
import ViewPostLink from '../ViewPostLink'
import styles from './helpers.module.sass'
import { PostDropDownMenu } from './PostDropDownMenu'
import PostRewardStat from './PostRewardStat'
import PostViewCount from './PostViewCount'
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
  isPromoted?: boolean
}

export const PostCreator: FC<PostCreatorProps> = ({
  postDetails,
  size,
  withSpaceName,
  withSpaceAvatar,
  space,
  isPromoted,
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
      withFollowButton={false}
      isShort={true}
      isPadded={false}
      size={size}
      afterName={
        isPromoted ? (
          <Tag color='processing' className='ml-2'>
            Promoted
          </Tag>
        ) : undefined
      }
      details={
        <div>
          {withSpaceName && space && (
            <>
              <SpacePreviewPopup
                space={space}
                className='d-inline'
                content={<SpaceNameAsLink space={space} className='DfGreyLink' />}
              />
              {' • '}
            </>
          )}
          <ViewPostLink
            className='DfGreyLink !BreakWord'
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

    const wrapperClassName = clsx(className, 'w-100 d-flex', {
      DfPostImagePreviewWrapperCropped: shouldImageBeCropped,
    })
    return (
      <div
        className='position-relative DfPostImagePreviewWrapper'
        style={{ overflow: 'hidden', borderRadius: '5px' }}
      >
        <Image
          src={resolveIpfsUrl(image)}
          className='DfPostImagePreview'
          wrapperStyle={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
            transformOrigin: 'center',
          }}
          style={{
            objectFit: 'cover',
          }}
          preview={withPreview ? { mask: null } : false}
          wrapperClassName={wrapperClassName}
          onLoad={onImgLoad}
        />
        <Image
          src={resolveIpfsUrl(image)}
          className='DfPostImagePreview'
          style={{ objectFit: 'contain' }}
          preview={withPreview ? { mask: null } : false}
          wrapperClassName={wrapperClassName}
          onLoad={onImgLoad}
        />
      </div>
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

  // mostly the post that doesn't have contents are shared post, so this div mt-3 is needed to add offset above the original post card
  if (!content.image && !content.body && !content.title) return <div className='mt-3' />

  return (
    <div className='DfContent'>
      <ViewPostLink
        post={post}
        space={space}
        title={
          <div className={clsx('d-flex flex-column GapSmall', styles.PostContent)}>
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
  preview?: boolean
}

export const PostActionsPanel: FC<PostActionsPanelProps> = props => {
  const { postDetails, /* space, */ withBorder, className, preview } = props
  const {
    post: { struct },
  } = postDetails

  return (
    <div className={`DfActionsPanel ${withBorder && 'DfActionBorder'} ${className ?? ''}`}>
      <div className={clsx('d-flex align-items-center justify-content-between GapNormal w-100')}>
        <div className='d-flex align-items-center GapNormal'>
          <SuperLike post={struct} />
          <PostRewardStat postId={struct.id} />
        </div>
        <div className='d-flex align-items-center GapNormal'>
          {preview && <CommentAction {...props} />}
          <ShareDropdown
            postDetails={props.postDetails}
            space={postDetails.space?.struct}
            className='p-0'
          />
          <PostViewCount postId={struct.id} />
        </div>
      </div>
      {/* <ShareDropdown postDetails={postDetails} space={space} className='DfAction' /> */}
    </div>
  )
}

function CommentAction(props: PostActionsPanelProps & { iconClassName?: string }) {
  const { postDetails, toogleCommentSection, iconClassName } = props
  const isMobile = useIsMobileWidthOrDevice()
  const {
    post: {
      struct: { repliesCount },
    },
  } = postDetails

  return (
    <Button
      type='default'
      style={{ border: 'none', boxShadow: 'none', gap: '0.5rem' }}
      className='p-0 d-flex align-items-center ColorMuted FontWeightMedium'
      onClick={() => {
        toogleCommentSection?.()
      }}
    >
      <TbMessageCircle2 className={clsx('FontSemilarge', iconClassName)} />
      {(repliesCount ?? 0) > 0 || isMobile ? repliesCount : 'Comment'}
    </Button>
  )
}

type PostPreviewProps = {
  postDetails: PostWithSomeDetails
  space?: SpaceData
  withImage?: boolean
  withTags?: boolean
  withMarginForCardType?: boolean
  isPromoted?: boolean
}

export const SharePostContent = (props: PostPreviewProps) => {
  const {
    postDetails: { ext },
    isPromoted,
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

  return (
    <div className='DfSharedSummary'>
      <RegularPreview
        postDetails={props.postDetails}
        space={props.space}
        isPromoted={isPromoted}
        withActions={false}
      />
      <Segment className={clsx('DfPostPreview')}>
        <OriginalPost />
      </Segment>
    </div>
  )
}

export const PostPreviewCreatorInfo = (
  props: Pick<PostPreviewProps, 'postDetails' | 'space' | 'isPromoted'>,
) => {
  const { postDetails, space, isPromoted } = props
  const {
    post: { struct, content },
  } = postDetails
  const isMobile = useIsMobileWidthOrDevice()

  if (!struct || !content) return null

  return (
    <div className='DfRow'>
      <PostCreator
        postDetails={postDetails}
        space={space}
        isPromoted={isPromoted}
        withSpaceName
        withSpaceAvatar
      />
      <div className='d-flex align-items-center align-self-start GapTiny'>
        {space && !isMobile && (
          <FollowSpaceButton
            className='mr-1 px-2'
            style={{ height: '28px' }}
            size='small'
            type='default'
            ghost={false}
            space={space.struct}
            withUnfollowButton={false}
          />
        )}
        <PostDropDownMenu
          post={postDetails.post}
          space={space?.struct}
          withEditButton={!isMobile}
          className='ColorMuted'
          style={{ position: 'relative', top: '1px' }}
        />
      </div>
    </div>
  )
}

export const InfoPostPreview: FC<PostPreviewProps> = props => {
  const {
    postDetails,
    space,
    withImage = true,
    withTags,
    withMarginForCardType,
    isPromoted,
  } = props
  const {
    post: { struct, content },
  } = postDetails

  const embedType = getEmbedLinkType(content?.link)
  if (!struct || !content) return null

  return (
    <div className='DfInfo'>
      <div className='DfRow'>
        <div className='w-100'>
          <PostPreviewCreatorInfo postDetails={postDetails} space={space} isPromoted={isPromoted} />
          {content.link && (
            <Embed isPreview post={postDetails.post} link={content.link} className='mt-3' />
          )}
          <PostContent
            withMarginForCardType={withMarginForCardType && !withTags}
            postDetails={postDetails}
            space={space?.struct}
            withImage={withImage && !embedType}
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

export function useShouldRenderMinStakeAlert(post: PostStruct) {
  const { isExist, validByCreatorMinStake, validByCreationDate } = useCanPostSuperLiked(post.id)
  const isMyPost = useIsMyAddress(post.ownerId)
  const isMadeWithinOneMinute = Date.now() - post.createdAtTime < 60 * 1000
  const myAddress = useMyAddress() ?? ''
  const { data: totalStake } = useFetchTotalStake(myAddress)

  if (!isMyPost) return false

  if (
    (isExist && !validByCreatorMinStake && validByCreationDate) ||
    (!isExist && isMadeWithinOneMinute && !totalStake?.hasStakedEnough)
  ) {
    return true
  }

  return false
}

export default function PostNotEnoughMinStakeAlert({ post }: { post: PostStruct }) {
  const shouldRenderAlert = useShouldRenderMinStakeAlert(post)

  if (shouldRenderAlert) {
    return (
      <div className={styles.PostNotEnoughMinStakeAlert}>
        <div className='d-flex align-items-center GapTiny'>
          <TbCoins />
          <span>You need to lock SUB in order to receive rewards.</span>
        </div>
        <CustomLink href={getContentStakingLink()}>
          <a target='_blank' className='DfLink'>
            Lock SUB
          </a>
        </CustomLink>
      </div>
    )
  }

  return null
}

export function PinnedPostIcon({ postId }: { postId: string }) {
  const isPinned = isPinnedPost(postId)
  if (!isPinned) return null

  return (
    <div
      className='d-flex align-items-center GapTiny ColorMuted mb-1 FontWeightSemibold'
      style={{ marginTop: '-12px' }}
    >
      <RiPushpin2Fill />
      <span>Pinned</span>
    </div>
  )
}
