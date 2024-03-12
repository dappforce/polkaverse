import { newLogger } from '@subsocial/utils'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { addPostView } from 'src/components/utils/datahub/post-view'
import { Segment } from 'src/components/utils/Segment'
import { POST_VIEW_DURATION } from 'src/config/constants'
import { PostWithAllDetails, PostWithSomeDetails, SpaceData } from 'src/types'
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

export function PostPreview(props: PreviewProps) {
  const { postDetails, space: externalSpace, showPinnedIcon } = props
  const myAddress = useMyAddress()
  const {
    space: globalSpace,
    post: { struct: post },
  } = postDetails
  const { isSharedPost } = post
  const space = externalSpace || globalSpace
  const isUnlisted = useIsUnlistedPost({ post, space: space?.struct })

  const { inView, ref } = useInView()
  useEffect(() => {
    if (!inView) return

    const timeoutId = setTimeout(async () => {
      try {
        await addPostView({
          args: { viewerId: myAddress, duration: POST_VIEW_DURATION, postPersistentId: post.id },
        })
      } catch (err) {
        console.error('Failed to add view', err)
      }
    }, POST_VIEW_DURATION)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [inView, myAddress])

  if (isUnlisted) return null

  const postContent = postDetails.post.content
  const isEmptyContent = !isSharedPost && !postContent?.title && !postContent?.body
  if (isEmptyContent) return null

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
