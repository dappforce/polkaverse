import { FC, useState } from 'react'
import { CommentSection } from 'src/components/comments/CommentsSection'
import { SpaceData } from 'src/types'
import { InfoPostPreview, PostActionsPanel } from './helpers'
import { PreviewProps } from './PostPreview'

export type InnerPreviewProps = PreviewProps & {
  space?: SpaceData
}

type ComponentType = FC<InnerPreviewProps>

/** Sloooooooow Regular Preview */
export const RegularPreview: ComponentType = props => {
  const { postDetails, space, withImage, replies, withTags, withActions } = props
  const [commentsSection, setCommentsSection] = useState(false)

  return (
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
