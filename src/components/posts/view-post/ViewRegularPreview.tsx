import { FC } from 'react'
import { SpaceData } from 'src/types'
import { InfoPostPreview, PostActionsPanel, PostNotFound } from './helpers'
import { PreviewProps } from './PostPreview'

export type InnerPreviewProps = PreviewProps & {
  space?: SpaceData
}

type ComponentType = FC<InnerPreviewProps>

/** Sloooooooow Regular Preview */
export const RegularPreview: ComponentType = props => {
  const { postDetails, space, withImage, withTags, withActions } = props

  const { isSharedPost } = postDetails.post.struct

  return !isSharedPost ? (
    <>
      <InfoPostPreview
        postDetails={postDetails}
        space={space}
        withImage={withImage}
        withTags={withTags}
        withMarginForCardType={!withActions}
      />
      {withActions && <PostActionsPanel postDetails={postDetails} space={space?.struct} />}
    </>
  ) : (
    <PostNotFound />
  )
}
