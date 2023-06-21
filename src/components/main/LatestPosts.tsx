// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useFetchMyReactionsByPostIds } from 'src/rtk/features/reactions/myPostReactionsHooks'
import { PostWithAllDetails } from 'src/types'
import DataList from '../lists/DataList'
import { PublicPostPreviewById } from '../posts/PublicPostPreview'

type Props = {
  postsData: PostWithAllDetails[]
  type: 'post' | 'comment'
}

export const LatestPosts = (props: Props) => {
  const { postsData = [], type } = props
  const posts = postsData.filter(x => typeof x.post.struct !== 'undefined')
  useFetchMyReactionsByPostIds(posts.map(({ id }) => id))

  if (posts.length === 0) {
    return null
  }

  return (
    <DataList
      title={`Latest ${type}s`}
      dataSource={postsData}
      getKey={item => item.id}
      renderItem={item => <PublicPostPreviewById postId={item.id} />}
    />
  )
}
