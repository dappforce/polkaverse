// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { PostUpdate } from '@subsocial/api/substrate/wrappers'
import { useDispatch } from 'react-redux'
import { fetchPost } from 'src/rtk/features/posts/postsSlice'
import { DataSourceTypes, PostStruct } from 'src/types'
import { useSubsocialApi } from '../substrate'
import HiddenButton from '../utils/HiddenButton'

type HiddenPostButtonProps = {
  post: PostStruct
  asLink?: boolean
}

export function HiddenPostButton(props: HiddenPostButtonProps) {
  const dispatch = useDispatch()
  const { subsocial } = useSubsocialApi()
  const { post } = props
  const { hidden, isComment } = post
  const postType = isComment ? 'comment' : 'post'

  const newTxParams = () => {
    const update = PostUpdate({
      // If we provide a new space_id in update, it will move this post to another space.
      hidden: !hidden,
    })
    return [post.id, update]
  }

  const onTxSuccess = () => {
    dispatch(
      fetchPost({ api: subsocial, id: post.id, dataSource: DataSourceTypes.CHAIN, reload: true }),
    )
  }

  return (
    <HiddenButton
      type={postType}
      newTxParams={newTxParams}
      onTxSuccess={onTxSuccess}
      struct={post}
      {...props}
    />
  )
}

export default HiddenPostButton
