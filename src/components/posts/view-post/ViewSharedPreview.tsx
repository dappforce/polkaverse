import { FC } from 'react'
import { useSelectPost } from 'src/rtk/app/hooks'
import { asSharedPostStruct } from 'src/types'
import { InnerPreviewProps } from '.'
import { PostActionsPanel, PostCreator, SharePostContent } from './helpers'
import { PostDropDownMenu } from './PostDropDownMenu'

type ComponentType = FC<InnerPreviewProps>

export const SharedPreview: ComponentType = props => {
  const { postDetails, space, withActions } = props
  const sharedPostId = asSharedPostStruct(postDetails.post.struct).originalPostId
  postDetails.ext = useSelectPost(sharedPostId)

  return (
    <>
      <div className='DfRow'>
        <PostCreator withSpaceAvatar postDetails={postDetails} space={space} withSpaceName />
        <PostDropDownMenu space={space?.struct} post={postDetails.post} />
      </div>
      <div className='my-3'>
        <SharePostContent postDetails={postDetails} space={space} />
      </div>
      {withActions && <PostActionsPanel postDetails={postDetails} space={space?.struct} preview />}
    </>
  )
}
