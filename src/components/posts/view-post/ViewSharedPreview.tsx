import { FC } from 'react'
import { useIsMobileWidthOrDevice } from 'src/components/responsive'
import FollowSpaceButton from 'src/components/utils/FollowSpaceButton'
import { useSelectPost } from 'src/rtk/app/hooks'
import { asSharedPostStruct } from 'src/types'
import { InnerPreviewProps } from '.'
import { PostActionsPanel, PostCreator, SharePostContent } from './helpers'
import { PostDropDownMenu } from './PostDropDownMenu'

type ComponentType = FC<InnerPreviewProps>

export const SharedPreview: ComponentType = props => {
  const { postDetails, space, withActions } = props
  const isMobile = useIsMobileWidthOrDevice()
  const sharedPostId = asSharedPostStruct(postDetails.post.struct).originalPostId
  postDetails.ext = useSelectPost(sharedPostId)

  return (
    <>
      <div className='DfRow'>
        {space && !isMobile && (
          <FollowSpaceButton
            className='mr-1 px-2'
            style={{ height: '28px' }}
            size='small'
            type='default'
            ghost={false}
            space={space.struct}
            withUnfollowButton={false}
          />
        )}
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
