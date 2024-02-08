import { FC, useState } from 'react'
import { CommentSection } from 'src/components/comments/CommentsSection'
import { useSelectPost } from 'src/rtk/app/hooks'
import { asSharedPostStruct } from 'src/types'
import { InnerPreviewProps } from '.'
import { PostActionsPanel, SharePostContent } from './helpers'

type ComponentType = FC<InnerPreviewProps>

export const SharedPreview: ComponentType = props => {
  const { postDetails, space, withActions, replies } = props
  const [commentsSection, setCommentsSection] = useState(false)
  const sharedPostId = asSharedPostStruct(postDetails.post.struct).originalPostId
  postDetails.ext = useSelectPost(sharedPostId)

  return (
    <>
      <div className='mb-3'>
        <SharePostContent postDetails={postDetails} space={space} />
      </div>
      {withActions && (
        <PostActionsPanel
          postDetails={postDetails}
          space={space?.struct}
          preview
          toogleCommentSection={() => setCommentsSection(!commentsSection)}
        />
      )}
      {commentsSection && (
        <CommentSection
          post={postDetails}
          replies={replies}
          space={space?.struct}
          eventSource='post-preview'
        />
      )}
    </>
  )
}
