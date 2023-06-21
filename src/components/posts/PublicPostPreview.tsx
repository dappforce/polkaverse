// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import React from 'react'
import { PostId } from 'src/types'
import { useSelectPost } from '../../rtk/features/posts/postsHooks'
import PostPreview from '../posts/view-post/PostPreview'

type Props = {
  postId: PostId
}

export const PublicPostPreviewById = React.memo(({ postId }: Props) => {
  const post = useSelectPost(postId)

  if (!post) return null

  return <PostPreview postDetails={post} withActions />
})
