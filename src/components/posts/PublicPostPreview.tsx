import React from 'react'
import { PostId } from 'src/types'
import { useSelectPost } from '../../rtk/features/posts/postsHooks'
import PostPreview from '../posts/view-post/PostPreview'

type Props = {
  postId: PostId
  showPinnedIcon?: boolean
}

export const PublicPostPreviewById = React.memo(({ postId, showPinnedIcon }: Props) => {
  const post = useSelectPost(postId)

  if (!post) return null

  return <PostPreview postDetails={post} withActions showPinnedIcon={showPinnedIcon} />
})
