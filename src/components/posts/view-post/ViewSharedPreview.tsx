import { FC } from 'react'
import { useOpenCloseChatWindow, useSelectPost, useSetupGrillConfig } from 'src/rtk/app/hooks'
import { asSharedPostStruct } from 'src/types'
import { InnerPreviewProps } from '.'
import { PostActionsPanel, PostCreator, SharePostContent } from './helpers'
import { PostDropDownMenu } from './PostDropDownMenu'

type ComponentType = FC<InnerPreviewProps>

export const SharedPreview: ComponentType = props => {
  const { postDetails, space, withActions } = props
  const sharedPostId = asSharedPostStruct(postDetails.post.struct).originalPostId
  postDetails.ext = useSelectPost(sharedPostId)

  const setGrillChatVisibility = useOpenCloseChatWindow()
  const setupGrillConfig = useSetupGrillConfig()

  const openCommentSection = () => {
    setupGrillConfig(space?.id ?? '', postDetails.id, postDetails.post.content?.title)
    setGrillChatVisibility(true)
  }

  return (
    <>
      <div className='DfRow'>
        <PostCreator withSpaceAvatar postDetails={postDetails} space={space} withSpaceName />
        <PostDropDownMenu space={space?.struct} post={postDetails.post} />
      </div>
      <div className='mt-3'>
        <SharePostContent postDetails={postDetails} space={space} />
      </div>
      {withActions && (
        <PostActionsPanel
          postDetails={postDetails}
          space={space?.struct}
          toogleCommentSection={() => openCommentSection()}
          preview
        />
      )}
    </>
  )
}
