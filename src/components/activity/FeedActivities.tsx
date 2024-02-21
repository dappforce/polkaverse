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

export const FeedActivities = ({
  showMuted,
  ...props
}: ActivityProps<PostId> & { showMuted?: boolean }) => {
  return (
    <InnerActivities
      {...props}
      getKey={postId => postId}
      renderItem={(postId: PostId) => (
        <PublicPostPreviewById postId={postId} showMuted={showMuted} />
      )}
    />
  )
}
