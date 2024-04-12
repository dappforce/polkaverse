import { isEmptyArray } from '@subsocial/utils'
import { FC, useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import config from 'src/config'
import { DEFAULT_PAGE_SIZE } from 'src/config/ListData.config'
import { GqlClient, useDfApolloClient } from 'src/graphql/ApolloProvider'
import { GetLatestPostIds } from 'src/graphql/__generated__/GetLatestPostIds'
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
import { getLatestCommunityPostIds, PINNED_POST_ID } from './pinned-post'
import { PublicPostPreviewById } from './PublicPostPreview'

const { promotedPosts } = config

type Props = {
  initialPostIds?: PostId[]
  totalPostCount: number
  kind: PostKind
  filter: PostFilterType
  dateFilter?: DateFilterType
  shouldWaitApiReady?: boolean
}

const PROMOTED_POST_GAP = 10

export const loadMorePostsFn = async (
  loadMoreValues: LoadMoreValues<PostFilterType> & { currentSessionKey: string },
) => {
  const {
    client,
    size,
    page,
    subsocial,
    myAddress,
    dispatch,
    kind = PostKind.RegularPost,
    filter,
    currentSessionKey,
  } = loadMoreValues

  if (filter.type === undefined) return []

  const offset = (page - 1) * size

  let postIds: string[] = []

  if (filter.type === 'hot') {
    const posts = await getHotPosts({ offset, limit: DEFAULT_PAGE_SIZE })
    postIds = posts.data.map(value => value.persistentPostId)
    if (offset === 0) {
      postIds = Array.from(new Set([PINNED_POST_ID, ...postIds].filter(Boolean) as string[]))
    } else {
      postIds = postIds.filter(id => id !== PINNED_POST_ID)
    }
  } else if (!isSuggested(filter.type) && client) {
    const data = await loadPostsByQuery({ client, kind, offset, filter })
    const { posts } = data as GetLatestPostIds
    postIds = posts.map(value => value.id)
  } else {
    const allSuggestedPotsIds = await loadSuggestedPostIds({ subsocial, client })
    postIds = getSuggestedPostIdsByPage(allSuggestedPotsIds, size, page)
  }

  let {
    lastPromotedPostIndex = 0,
    circle: promotedPostCircle = 0,
    initialPage = 1,
    dataSource = {},
  } = sessionPageAndDataMap.get(currentSessionKey) || {}

  const { newPostIds, newPromotedPostLastIndex, circle } = await getNewArrayWithPromotedPosts(
    postIds,
    {
      lastPromotedPostIndex,
      circle: promotedPostCircle,
    },
    client,
  )

  const newPromotedPostData =
    page + 1 !== initialPage
      ? {
          lastPromotedPostIndex: newPromotedPostLastIndex,
          circle,
        }
      : {
          lastPromotedPostIndex: 0,
          circle: 0,
        }

  sessionPageAndDataMap.set(currentSessionKey, {
    initialPage,
    dataSource,
    ...newPromotedPostData,
  })

  const postIdsWithoutPromotionPart = newPostIds.map(id => id.split('-')[0])

  await dispatch(
    fetchPosts({
      api: subsocial,
      withReactionByAccount: myAddress,
      ids: postIdsWithoutPromotionPart,
      reload: true,
      dataSource: DataSourceTypes.SQUID,
    }),
  )

  return newPostIds
}

const getNewArrayWithPromotedPosts = async (
  postIds: string[],
  lastPromotedPost: LastPromotedPost,
  client: GqlClient | undefined,
) => {
  const promotedPostIds = isEmptyArray(promotedPosts)
    ? (await getLatestCommunityPostIds(client)) || []
    : promotedPosts

  const postIdsChanks = postIds.length / PROMOTED_POST_GAP

  const postIdsSlices = Array.from({ length: postIdsChanks }, (_, i) => {
    return postIds.slice(i * PROMOTED_POST_GAP, (i + 1) * PROMOTED_POST_GAP)
  })

  let postIndex = lastPromotedPost.lastPromotedPostIndex
  let circle = lastPromotedPost.circle

  postIdsSlices.forEach(slice => {
    if (promotedPostIds[postIndex]) {
      slice.splice(PROMOTED_POST_GAP, 0, `${promotedPostIds[postIndex]}-promoted-${circle}`)

      postIndex = promotedPostIds.length - 1 === postIndex ? 0 : postIndex + 1
      circle = postIndex === 0 ? circle + 1 : circle
    }
  })

  return {
    newPostIds: postIdsSlices.flat(),
    newPromotedPostLastIndex: postIndex,
    circle,
  }
}

const sessionPageAndDataMap: Map<
  string,
  {
    initialPage: number
    dataSource: Record<number, string[]>
    lastPromotedPostIndex: number
    circle: number
  }
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

type LastPromotedPost = {
  lastPromotedPostIndex: number
  circle: number
}

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
      currentSessionKey,
    })

    let {
      dataSource,
      lastPromotedPostIndex = 0,
      circle = 0,
    } = sessionPageAndDataMap.get(currentSessionKey) || {}
    if (!dataSource) dataSource = {}

    dataSource[page] = res

    sessionPageAndDataMap.set(currentSessionKey, {
      initialPage: page + 1,
      dataSource,
      lastPromotedPostIndex,
      circle,
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
          <PublicPostPreviewById
            shouldHideChatRooms={true}
            showPinnedIcon={
              (isSuggested(filter) || filter === 'hot') && !postId.includes('promoted')
            }
            postId={postId.split('-')[0]}
            isPromoted={postId.includes('promoted')}
          />
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
