// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { fetchPosts } from 'src/rtk/features/posts/postsSlice'
import { DataSourceTypes, PostId } from 'src/types'
import { PublicPostPreviewById } from '../posts/PublicPostPreview'
import { getPageOfIds } from '../utils/getIds'
import { InnerActivities } from './InnerActivities'
import { ActivityProps, LoadMoreFn, LoadMoreProps } from './types'

export const onchainLoadMorePosts = async (props: LoadMoreProps): Promise<PostId[]> => {
  const { subsocial, dispatch, address, page, size, ids = [] } = props

  if (!address) return []

  const postIds = await getPageOfIds(ids, { page, size })

  await dispatch(
    fetchPosts({ api: subsocial, ids: postIds, withReactionByAccount: address, withExt: true }),
  )

  return postIds
}

export const createLoadMorePosts =
  (getIds: LoadMoreFn<string>) =>
  async (props: LoadMoreProps): Promise<PostId[]> => {
    const { subsocial, dispatch, address, myAddress, page, size } = props

    if (!address) return []

    const offset = (page - 1) * size
    const ids = (await getIds({ address, offset, limit: size })) || []

    await dispatch(
      fetchPosts({
        api: subsocial,
        ids,
        withReactionByAccount: myAddress,
        withExt: true,
        dataSource: DataSourceTypes.SQUID,
      }),
    )
    return ids
  }

export const FeedActivities = (props: ActivityProps<PostId>) => {
  return (
    <InnerActivities
      {...props}
      getKey={postId => postId}
      renderItem={(postId: PostId) => <PublicPostPreviewById postId={postId} />}
    />
  )
}
