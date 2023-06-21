// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { InnerLoadMoreFn } from 'src/components/lists'
import { InfinitePageList } from 'src/components/lists/InfiniteList'
import { PublicPostPreviewById } from 'src/components/posts/PublicPostPreview'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { getPageOfIds } from 'src/components/utils/getIds'
import { Pluralize } from 'src/components/utils/Plularize'
import { fetchPosts } from 'src/rtk/features/posts/postsSlice'
import { DataSourceTypes, PostId, PostWithSomeDetails, SpaceData } from 'src/types'
import { FollowerCanPostAlert } from '../permissions/FollowerCanPostAlert'
import { CreatePostButton } from './CreatePostButton'

type Props = {
  spaceData: SpaceData
  postIds: PostId[]
  posts: PostWithSomeDetails[]
}

const PostsSectionTitle = React.memo((props: Props) => {
  const { spaceData } = props
  const { struct: space } = spaceData
  const { postsCount } = space

  return (
    <div className='w-100 d-flex justify-content-between align-items-baseline'>
      <span style={{ marginRight: '1rem' }}>
        <Pluralize count={postsCount || 0} singularText='Post' />
      </span>
      {!!postsCount && <CreatePostButton space={space} title={'Write Post'} className='mb-2' />}
    </div>
  )
})

const InfiniteListOfPublicPosts = (props: Props) => {
  const { spaceData, posts, postIds } = props
  const { struct: space } = spaceData
  const { postsCount } = space
  const initialPostIds = posts.map(p => p.id)

  const dispatch = useDispatch()
  const { subsocial, isApiReady } = useSubsocialApi()

  const loadMore: InnerLoadMoreFn = async (page, size) => {
    if (!isApiReady) return []

    const pageIds = getPageOfIds(postIds, { page, size })
    await dispatch(fetchPosts({ api: subsocial, ids: pageIds, dataSource: DataSourceTypes.SQUID }))

    return pageIds
  }

  const List = useCallback(
    () => (
      <InfinitePageList
        loadingLabel='Loading more posts...'
        title={<PostsSectionTitle {...props} />}
        dataSource={initialPostIds}
        loadMore={loadMore}
        totalCount={postsCount || 0}
        noDataDesc='No posts yet'
        noDataExt={<CreatePostButton space={space} />}
        getKey={postId => postId}
        renderItem={postId => <PublicPostPreviewById postId={postId} />}
        beforeList={<FollowerCanPostAlert space={space} />}
      />
    ),
    [isApiReady],
  )

  return <List />
}

export const PostPreviewsOnSpace = (props: Props) => {
  return (
    <>
      <InfiniteListOfPublicPosts {...props} />
    </>
  )
}
