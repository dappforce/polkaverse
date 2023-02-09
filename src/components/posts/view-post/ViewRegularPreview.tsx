import { FC, useState } from 'react'
import { SpaceData } from 'src/types'
import { CommentSection } from '../../comments/CommentsSection'
import { InfoPostPreview, PostActionsPanel, PostNotFound } from './helpers'
import { PreviewProps } from './PostPreview'

export type InnerPreviewProps = PreviewProps & {
  space?: SpaceData
}

type ComponentType = FC<InnerPreviewProps>

/** Sloooooooow Regular Preview */
export const RegularPreview: ComponentType = props => {
  const { postDetails, space, replies, withImage, withTags, withActions } = props
  const [commentsSection, setCommentsSection] = useState(false)
  const { isSharedPost } = postDetails.post.struct

  const isTwitterContent = !!postDetails.post.content?.tweet?.id

  return !isSharedPost ? (
    <>
      <InfoPostPreview
        postDetails={postDetails}
        space={space}
        withImage={withImage}
        withTags={withTags}
        withMarginForCardType={!withActions}
      />
      {withActions && (
        <PostActionsPanel
          postDetails={postDetails}
          space={space?.struct}
          toogleCommentSection={() => setCommentsSection(!commentsSection)}
          preview
          withBorder={!isTwitterContent}
        />
      )}
      {commentsSection && (
        <CommentSection post={postDetails} replies={replies} space={space?.struct} withBorder />
      )}
    </>
  ) : (
    <PostNotFound />
  )
}
