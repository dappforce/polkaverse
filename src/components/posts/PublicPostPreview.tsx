import React from 'react'
import { useCanPostSuperLiked } from 'src/rtk/features/activeStaking/hooks'
import { PostId } from 'src/types'
import { useSelectPost } from '../../rtk/features/posts/postsHooks'
import PostPreview from '../posts/view-post/PostPreview'
import { useShowLikeablePostsContext } from './ShowLikeablePostsContext'

type Props = {
  postId: PostId
  showPinnedIcon?: boolean
  isPromoted?: boolean
  showMuted?: boolean
}

export const PublicPostPreviewById = React.memo(
  ({ postId, showPinnedIcon, showMuted, isPromoted }: Props) => {
    const post = useSelectPost(postId, showMuted)
    const { value: showLikeablePostOnly } = useShowLikeablePostsContext()
    const { validByCreatorMinStake } = useCanPostSuperLiked(postId)

    if (!post || (showLikeablePostOnly && !validByCreatorMinStake && !isPromoted)) return null

    return (
      <PostPreview
        postDetails={post}
        withActions
        showPinnedIcon={showPinnedIcon}
        isPromoted={isPromoted}
      />
    )
  },
)
