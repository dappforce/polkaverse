import React from 'react'
import { useCanPostSuperLiked } from 'src/rtk/features/activeStaking/hooks'
import { PostId } from 'src/types'
import { useSelectPost } from '../../rtk/features/posts/postsHooks'
import PostPreview from '../posts/view-post/PostPreview'
import { useShowActiveStakingPostsContext } from './ShowActiveStakingPostsContext'

type Props = {
  postId: PostId
}

export const PublicPostPreviewById = React.memo(({ postId }: Props) => {
  const post = useSelectPost(postId)
  const { value: showActiveStakingOnly } = useShowActiveStakingPostsContext()
  const { validByCreatorMinStake } = useCanPostSuperLiked(postId)

  if (!post || (showActiveStakingOnly && !validByCreatorMinStake)) return null

  return <PostPreview postDetails={post} withActions />
})
