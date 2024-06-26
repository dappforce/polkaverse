import { newLogger } from '@subsocial/utils'
import { useRouter } from 'next/router'
import { useInView } from 'react-intersection-observer'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { Segment } from 'src/components/utils/Segment'
import { useIsPostBlocked } from 'src/rtk/features/moderation/hooks'
import { asSharedPostStruct, PostWithAllDetails, PostWithSomeDetails, SpaceData } from 'src/types'
import {
  HiddenPostAlert,
  PinnedPostIcon,
  RegularPreview,
  SharedPreview,
  useIsUnlistedPost,
} from '.'
import { usePostViewTracker } from '../PostViewSubmitter'
import PostNotEnoughMinStakeAlert from './helpers'

const log = newLogger('ViewPost')

export type BarePreviewProps = {
  withImage?: boolean
  withTags?: boolean
  withActions?: boolean
  replies?: PostWithAllDetails[]
  asRegularPost?: boolean
}

export type PreviewProps = BarePreviewProps & {
  shouldHideChatRooms?: boolean
  postDetails: PostWithSomeDetails
  space?: SpaceData
  showPinnedIcon?: boolean
  isPromoted?: boolean
}

const HIDE_PREVIEW_FROM_SPACE: string[] = [
  '12660', // Grill by Subsocial
  '12659', // Grilled
  '12662', // Offchain Chats
  '12661', // Grill Widgets
  '12455', // Community Chats
  '12410', // Sandbox Highlights
  '12466', // Staging space
  '27631', // Apillon default hub
  '8105', // Sam space 1
  '18133', // Sam space 2
]
export function PostPreview(props: PreviewProps) {
  const router = useRouter()
  const { postDetails, space: externalSpace, showPinnedIcon, shouldHideChatRooms } = props
  const myAddress = useMyAddress()
  const {
    space: globalSpace,
    post: { struct: post },
  } = postDetails
  const { isSharedPost } = post
  const space = externalSpace || globalSpace
  const isUnlisted = useIsUnlistedPost({ post, space: space?.struct })
  const isHiddenChatRoom =
    shouldHideChatRooms && HIDE_PREVIEW_FROM_SPACE.includes(post.spaceId ?? '')
  // data is prefetched from the getPosts in postsSlice
  const { isBlocked } = useIsPostBlocked(post)

  const { inView, ref } = useInView()
  const sharedPostOriginalId = isSharedPost ? asSharedPostStruct(post).originalPostId : undefined
  usePostViewTracker(post.id, sharedPostOriginalId, inView && !!myAddress)

  if (
    isUnlisted ||
    isHiddenChatRoom ||
    isBlocked ||
    ((post.isRegularPost || post.isSharedPost) && !post.spaceId)
  )
    return null

  const postContent = postDetails.post.content
  const isEmptyContent = !isSharedPost && !postContent?.title && !postContent?.body
  if (isEmptyContent) return null

  // is home page latest posts tab
  const hideEmptySharedPost =
    router.pathname === '/' && router.query.tab === 'posts' && router.query.type === 'latest'
  const isEmptySharedPost =
    isSharedPost &&
    !postContent?.title &&
    !postContent?.body &&
    !postContent?.link &&
    !postContent?.image
  if (hideEmptySharedPost && isEmptySharedPost) return null

  log.debug('Render a post w/ id:', post.id)

  return (
    <Segment className='DfPostPreview' ref={ref}>
      {showPinnedIcon && <PinnedPostIcon postId={post.id} />}
      <HiddenPostAlert post={post} space={space?.struct} preview />
      {isSharedPost ? (
        <SharedPreview space={space} {...props} />
      ) : (
        <RegularPreview space={space} {...props} />
      )}
      <PostNotEnoughMinStakeAlert post={post} />
    </Segment>
  )
}

export default PostPreview
