import { FC } from 'react'
import { useOpenCloseChatWindow, useSetupGrillConfig } from 'src/rtk/app/hooks'
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

  const setGrillChatVisibility = useOpenCloseChatWindow()
  const setupGrillConfig = useSetupGrillConfig()

  const { isSharedPost } = postDetails.post.struct

  const openCommentSection = () => {
    setupGrillConfig(space?.id ?? '', postDetails.id, postDetails.post.content?.title)
    setGrillChatVisibility(true)
  }

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
          toogleCommentSection={() => openCommentSection()}
          preview
        />
      )}
    </>
  ) : (
    <PostNotFound />
  )
}
