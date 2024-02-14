import { FC, useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import config from 'src/config'
import { useDfApolloClient } from 'src/graphql/ApolloProvider'
import { GetLatestPostIds } from 'src/graphql/__generated__/GetLatestPostIds'
import { setPostScores } from 'src/rtk/features/posts/postScoreSlice'
import { fetchPosts } from 'src/rtk/features/posts/postsSlice'
import { DataSourceTypes, PostId } from 'src/types'
import { PostKind } from 'src/types/graphql-global-types'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { useMyAddress } from '../auth/MyAccountsContext'
import { InnerLoadMoreFn } from '../lists'
import { InfinitePageList } from '../lists/InfiniteList'
import { DateFilterType, LoadMoreValues, PostFilterType } from '../main/types'
import { isSuggested, loadPostsByQuery } from '../main/utils'
import { getHotPosts } from '../utils/datahub/posts'
import { getSuggestedPostIdsByPage, loadSuggestedPostIds } from './loadSuggestedPostIdsFromEnv'
import { PublicPostPreviewById } from './PublicPostPreview'

type Props = {
  initialPostIds?: PostId[]
  totalPostCount: number
  kind: PostKind
  filter: PostFilterType
  dateFilter?: DateFilterType
  shouldWaitApiReady?: boolean
}

export const loadMorePostsFn = async (loadMoreValues: LoadMoreValues<PostFilterType>) => {
  const {
    client,
    size,
    page,
    subsocial,
    myAddress,
    dispatch,
    kind = PostKind.RegularPost,
    filter,
  } = loadMoreValues

  if (filter.type === undefined) return []

  const offset = (page - 1) * size

  let postIds: string[] = []

  if (filter.type === 'hot') {
    const posts = await getHotPosts({ offset, limit: 100 })
    postIds = posts.data.map(value => value.persistentPostId)
    dispatch(
      setPostScores(
        posts.data.map(({ persistentPostId, score }) => ({ id: persistentPostId, score })),
      ),
    )
  } else if (!isSuggested(filter.type) && client) {
    const data = await loadPostsByQuery({ client, kind, offset, filter })
    const { posts } = data as GetLatestPostIds
    postIds = posts.map(value => value.id)
  } else {
    const allSuggestedPotsIds = await loadSuggestedPostIds({ subsocial, client })
    postIds = getSuggestedPostIdsByPage(allSuggestedPotsIds, size, page)
  }

  await dispatch(
    fetchPosts({
      api: subsocial,
      withReactionByAccount: myAddress,
      ids: postIds,
      reload: true,
      dataSource: DataSourceTypes.SQUID,
    }),
  )

  return postIds
}

const sessionPageAndDataMap: Map<
  string,
  { initialPage: number; dataSource: Record<number, string[]> }
> = new Map()
const getSessionKey = ({
  dateFilter,
  filter,
  kind,
}: {
  filter: string
  dateFilter: string | undefined
  kind: string
}) => `${filter}-${dateFilter}-${kind}`
const InfiniteListOfPublicPosts = (props: Props) => {
  const { totalPostCount, initialPostIds, kind, filter, dateFilter, shouldWaitApiReady } = props
  const client = useDfApolloClient()
  const dispatch = useDispatch()
  const { subsocial, isApiReady } = useSubsocialApi()
  const myAddress = useMyAddress()
  const [totalCount, setTotalCount] = useState(totalPostCount || 0)

  useSubsocialEffect(
    ({ subsocial }) => {
      if (!config.enableSquidDataSource && isSuggested(filter))
        loadSuggestedPostIds({ subsocial }).then(ids => setTotalCount(ids.length))
    },
    [filter],
  )

  useEffect(() => {
    if (config.enableSquidDataSource && isSuggested(filter))
      loadSuggestedPostIds({ client }).then(ids => setTotalCount(ids.length))
  }, [filter])

  const currentSessionKey = getSessionKey({ dateFilter, filter, kind })

  const entity = kind === PostKind.RegularPost ? 'posts' : 'comments'

  const loadMore: InnerLoadMoreFn = async (page, size) => {
    const res = await loadMorePostsFn({
      client,
      size,
      page,
      subsocial,
      myAddress,
      dispatch,
      kind,
      filter: {
        type: filter,
        date: dateFilter,
      },
    })
    let { dataSource } = sessionPageAndDataMap.get(currentSessionKey) || {}
    if (!dataSource) dataSource = {}
    dataSource[page] = res

    sessionPageAndDataMap.set(currentSessionKey, {
      initialPage: page + 1,
      dataSource,
    })
    return res
  }

  const currentSessionData = sessionPageAndDataMap.get(currentSessionKey)

  const isUsingBlockchainToFetch = shouldWaitApiReady || !config.enableSquidDataSource
  const loading = isUsingBlockchainToFetch && !isApiReady
  const List = useCallback(() => {
    return !loading ? (
      <InfinitePageList
        loadingLabel={`Loading more ${entity}...`}
        initialPage={currentSessionData?.initialPage}
        dataSource={Object.values(currentSessionData?.dataSource || {}).flat() || initialPostIds}
        loadMore={loadMore}
        totalCount={totalCount}
        noDataDesc={`No ${entity} yet`}
        getKey={postId => postId}
        renderItem={postId => (
          <PublicPostPreviewById showPinnedIcon={isSuggested(filter)} postId={postId} />
        )}
      />
    ) : null
  }, [filter, dateFilter, totalCount, isApiReady])

  return <List />
}

const LatestPostsPage: FC<Props> = props => {
  return <InfiniteListOfPublicPosts {...props} />
}

export default LatestPostsPage
