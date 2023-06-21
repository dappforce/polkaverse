// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { FC, useState } from 'react'
import { useSelectPost } from 'src/rtk/app/hooks'
import { asSharedPostStruct } from 'src/types'
import { InnerPreviewProps } from '.'
import { CommentSection } from '../../comments/CommentsSection'
import { PostActionsPanel, PostCreator, SharePostContent } from './helpers'
import { PostDropDownMenu } from './PostDropDownMenu'

type ComponentType = FC<InnerPreviewProps>

export const SharedPreview: ComponentType = props => {
  const { postDetails, space, withActions, replies } = props
  const [commentsSection, setCommentsSection] = useState(false)
  const sharedPostId = asSharedPostStruct(postDetails.post.struct).originalPostId
  postDetails.ext = useSelectPost(sharedPostId)

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
          toogleCommentSection={() => setCommentsSection(!commentsSection)}
          preview
        />
      )}
      {commentsSection && (
        <CommentSection post={postDetails} space={space?.struct} replies={replies} withBorder />
      )}
    </>
  )
}
