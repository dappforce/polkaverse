// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { newLogger } from '@subsocial/utils'
import { Segment } from 'src/components/utils/Segment'
import { PostWithAllDetails, PostWithSomeDetails, SpaceData } from 'src/types'
import { HiddenPostAlert, RegularPreview, SharedPreview, useIsUnlistedPost } from '.'

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
}

export function PostPreview(props: PreviewProps) {
  const { postDetails, space: externalSpace } = props
  const {
    space: globalSpace,
    post: { struct: post },
  } = postDetails
  const { isSharedPost } = post
  const space = externalSpace || globalSpace
  const isUnlisted = useIsUnlistedPost({ post, space: space?.struct })

  if (isUnlisted) return null

  const postContent = postDetails.post.content
  const isEmptyContent = !isSharedPost && !postContent?.title && !postContent?.body
  if (isEmptyContent) return null

  log.debug('Render a post w/ id:', post.id)

  return (
    <Segment className='DfPostPreview'>
      <HiddenPostAlert post={post} space={space?.struct} preview />
      {isSharedPost ? (
        <SharedPreview space={space} {...props} />
      ) : (
        <RegularPreview space={space} {...props} />
      )}
    </Segment>
  )
}

export default PostPreview
