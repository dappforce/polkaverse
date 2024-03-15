import { newLogger } from '@subsocial/utils'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { addPostView } from 'src/components/utils/datahub/post-view'
import { Segment } from 'src/components/utils/Segment'
import { POST_VIEW_DURATION } from 'src/config/constants'
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
  postDetails: PostWithSomeDetails
  space?: SpaceData
  showPinnedIcon?: boolean
}

// grill admin account and grill memes admin
const HIDE_PREVIEW_FROM_ACCOUNT = [
  '3rPYmfYVHG7NtuGDivDNZdMMRHgrwtVuswY9TWUaHQCU8tAo',
  '3oGjkULuNKRqi513BbohWiSgA2oKMrbSnPrcddpXYC4mtW1G',
]
export function PostPreview(props: PreviewProps) {
  const router = useRouter()
  const { postDetails, space: externalSpace, showPinnedIcon } = props
  const myAddress = useMyAddress()
  const {
    space: globalSpace,
    post: { struct: post },
  } = postDetails
  const { isSharedPost } = post
  const space = externalSpace || globalSpace
  const isUnlisted = useIsUnlistedPost({ post, space: space?.struct })
  const isHiddenPreview = HIDE_PREVIEW_FROM_ACCOUNT.includes(post.ownerId)

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

  if (isUnlisted || isHiddenPreview) return null

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
