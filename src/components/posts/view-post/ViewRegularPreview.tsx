import { FC, useState } from 'react'
import { CommentSection } from 'src/components/comments/CommentsSection'
import { useAppSelector } from 'src/rtk/app/store'
import { selectPostScore } from 'src/rtk/features/posts/postScoreSlice'
import { SpaceData } from 'src/types'
import { InfoPostPreview, PostActionsPanel, PostNotFound } from './helpers'
import { PreviewProps } from './PostPreview'

export type InnerPreviewProps = PreviewProps & {
  space?: SpaceData
}

type ComponentType = FC<InnerPreviewProps>

/** Sloooooooow Regular Preview */
export const RegularPreview: ComponentType = props => {
  const { postDetails, space, withImage, replies, withTags, withActions } = props
  const [commentsSection, setCommentsSection] = useState(false)

  const { isSharedPost } = postDetails.post.struct

  const score = useAppSelector(state => selectPostScore(state, postDetails.post.id))

  return !isSharedPost ? (
    <>
      <InfoPostPreview
        postDetails={postDetails}
        space={space}
        withImage={withImage}
        withTags={withTags}
        withMarginForCardType={!withActions}
      />
      {score?.score}
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
  ) : (
    <PostNotFound />
  )
}
