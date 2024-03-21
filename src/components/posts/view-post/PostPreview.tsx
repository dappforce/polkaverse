import { newLogger } from '@subsocial/utils'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { addPostView } from 'src/components/utils/datahub/post-view'
import { Segment } from 'src/components/utils/Segment'
import { POST_VIEW_DURATION } from 'src/config/constants'
import { useIsPostBlocked } from 'src/rtk/features/moderation/hooks'
import { asSharedPostStruct, PostWithAllDetails, PostWithSomeDetails, SpaceData } from 'src/types'
import {
  HiddenPostAlert,
  PinnedPostIcon,
  RegularPreview,
  SharedPreview,
  useIsUnlistedPost,
} from '.'
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
  const isBlocked = useIsPostBlocked(post)

  const { inView, ref } = useInView()
  useEffect(() => {
    if (!inView || !myAddress) return

    const timeoutId = setTimeout(async () => {
      try {
        const operations = [
          addPostView({
            args: { viewerId: myAddress, duration: POST_VIEW_DURATION, postPersistentId: post.id },
          }),
        ]
        if (post.isSharedPost) {
          const originalPostId = asSharedPostStruct(post).originalPostId
          operations.push(
            addPostView({
              args: {
                viewerId: myAddress,
                duration: POST_VIEW_DURATION,
                postPersistentId: originalPostId,
              },
            }),
          )
        }
        await Promise.all(operations)
      } catch (err) {
        console.error('Failed to add view', err)
      }
    }, POST_VIEW_DURATION)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [inView, myAddress])

  if (isUnlisted || isHiddenChatRoom || isBlocked) return null

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
