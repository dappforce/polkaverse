import { newLogger } from '@subsocial/utils'
import { Segment } from 'src/components/utils/Segment'
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

// grill admin account and grill memes admin
const HIDE_PREVIEW_FROM_ACCOUNT = [
  '3rPYmfYVHG7NtuGDivDNZdMMRHgrwtVuswY9TWUaHQCU8tAo',
  '3oGjkULuNKRqi513BbohWiSgA2oKMrbSnPrcddpXYC4mtW1G',
]
export function PostPreview(props: PreviewProps) {
  const { postDetails, space: externalSpace, showPinnedIcon } = props
  const {
    space: globalSpace,
    post: { struct: post },
  } = postDetails
  const { isSharedPost } = post
  const space = externalSpace || globalSpace
  const isUnlisted = useIsUnlistedPost({ post, space: space?.struct })
  const isHiddenPreview = HIDE_PREVIEW_FROM_ACCOUNT.includes(post.ownerId)

  if (isUnlisted || isHiddenPreview) return null

  const postContent = postDetails.post.content
  const isEmptyContent = !isSharedPost && !postContent?.title && !postContent?.body
  if (isEmptyContent) return null

  log.debug('Render a post w/ id:', post.id)

  return (
    <Segment className='DfPostPreview'>
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
