import { asAccountId, SubsocialApi } from '@subsocial/api'
import { nonEmptyArr, nonEmptyStr } from '@subsocial/utils'
import { Tabs } from 'antd'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { SearchResultsType } from 'src/components/utils/OffchainUtils'
import { Segment } from 'src/components/utils/Segment'
import { searchResults } from 'src/graphql/apis'
import { GetSearchResults_searchQuery_hits } from 'src/graphql/__generated__/GetSearchResults'
import messages from 'src/messages'
import { isBlockedAccount } from 'src/moderation'
import { useAppDispatch } from 'src/rtk/app/store'
import { createFetchDataFn } from 'src/rtk/app/wrappers'
import { fetchPosts } from 'src/rtk/features/posts/postsSlice'
import { fetchProfileSpaces } from 'src/rtk/features/profiles/profilesSlice'
import { fetchSpaces } from 'src/rtk/features/spaces/spacesSlice'
import { AccountId, DataSourceTypes, ElasticIndex, PostId, SpaceId } from 'src/types'
import { ElasticSearchIndexType } from 'src/types/graphql-global-types'
import { DataListItemProps, InnerLoadMoreFn } from '../lists'
import { DataListOptProps } from '../lists/DataList'
import { InfiniteListByData } from '../lists/InfiniteList'
import { PageContent } from '../main/PageWrapper'
import { PublicPostPreviewById } from '../posts/PublicPostPreview'
import { ProfilePreviewByAccountId } from '../profiles/address-views'
import { AddressProps } from '../profiles/address-views/utils/types'
import { PublicSpacePreviewById } from '../spaces/SpacePreview'
import { Loading } from '../utils'

const { TabPane } = Tabs

const AllTabKey = 'all'

const panes = [
  {
    key: AllTabKey,
    title: 'All',
  },
  {
    key: 'spaces',
    title: 'Spaces',
  },
  {
    key: 'posts',
    title: 'Posts',
  },
  {
    key: 'profiles',
    title: 'Profiles',
  },
]

type ReqParam = 'tab' | 'q' | 'tags' | 'spaceId'

const AccountPreview = (props: AddressProps) =>
  isBlockedAccount(props.address.toString()) ? null : (
    <Segment>
      <ProfilePreviewByAccountId {...props} />
    </Segment>
  )

const resultToPreview = ({ _index, _id }: SearchResultsType) => {
  switch (_index) {
    case ElasticIndex.spaces:
      return <PublicSpacePreviewById spaceId={_id} />
    case ElasticIndex.posts:
      return <PublicPostPreviewById postId={_id} />
    case ElasticIndex.profiles:
      return <AccountPreview address={_id} />
    default:
      return <></>
  }
}

type InnerSearchResultListProps<T> = DataListOptProps &
  DataListItemProps<T> & {
    loadingLabel?: string
  }

const isQueryAnAccountAddress = (query?: string | string[]) => {
  if (!query || !nonEmptyStr(query)) return undefined

  const queryLen = query.length
  if (queryLen < 46 || queryLen > 50) return undefined

  return asAccountId(query)
}

const InnerSearchResultList = <T extends SearchResultsType>(
  props: InnerSearchResultListProps<T>,
) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { subsocial: api, isApiReady } = useSubsocialApi()

  const getReqParam = (param: ReqParam) => {
    return router.query[param]
  }

  const getSearchHits = createFetchDataFn<GetSearchResults_searchQuery_hits[]>([])({
    // Need to define this since it can't be undefined
    chain: async ({ api }: { api: SubsocialApi }) => {
      return []
    },
    squid: async (
      {
        tab,
        tags,
        query,
        spaceId,
        offset,
        limit,
      }: {
        tab: ElasticSearchIndexType[]
        tags: string[]
        query: string
        spaceId: string
        offset: number
        limit: number
      },
      client,
    ) => {
      const hits = await searchResults(client, {
        indexes: tab,
        spaceId,
        q: query,
        tags,
        offset,
        limit,
      })

      const filteredHits: GetSearchResults_searchQuery_hits[] = hits.filter(
        hit => hit !== null,
      ) as GetSearchResults_searchQuery_hits[]

      return filteredHits
    },
  })

  const querySearch: InnerLoadMoreFn<SearchResultsType> = async (page, size) => {
    const tab = getReqParam('tab') as ElasticSearchIndexType[]
    const query = getReqParam('q') as string
    const tags = getReqParam('tags') as string[]
    const spaceId = getReqParam('spaceId') as string
    const offset = (page - 1) * size

    const hits = await getSearchHits(DataSourceTypes.SQUID, {
      chain: {
        api,
      },
      squid: {
        tab,
        spaceId,
        query,
        tags,
        offset,
        limit: size,
      },
    })

    const ownerIds: AccountId[] = []
    const spaceIds: SpaceId[] = []
    const postIds: PostId[] = []

    hits.forEach(({ _index, _id }) => {
      switch (_index) {
        case ElasticIndex.spaces: {
          spaceIds.push(_id)
          break
        }
        case ElasticIndex.posts: {
          postIds.push(_id)
          break
        }
        case ElasticIndex.profiles: {
          ownerIds.push(_id)
          break
        }
      }
    })

    await Promise.all([
      dispatch(fetchSpaces({ ids: spaceIds, api, dataSource: DataSourceTypes.SQUID })),
      dispatch(fetchProfileSpaces({ ids: ownerIds, api, dataSource: DataSourceTypes.SQUID })),
      dispatch(fetchPosts({ ids: postIds, api, dataSource: DataSourceTypes.SQUID })),
    ])
    return hits || []
  }

  const accountQuery = isQueryAnAccountAddress(getReqParam('q'))

  const List = useCallback(
    () =>
      isApiReady ? (
        <InfiniteListByData
          {...props}
          beforeList={
            accountQuery ? (
              <div className='mt-3'>
                <AccountPreview address={accountQuery} />
              </div>
            ) : null
          }
          loadMore={querySearch as InnerLoadMoreFn<any>}
          customNoData={accountQuery ? <></> : undefined}
        />
      ) : (
        <Loading label={messages.connectingToNetwork} />
      ),
    [router.asPath, isApiReady],
  )

  return <List />
}

const AllResultsList = () => (
  <InnerSearchResultList
    loadingLabel={'Loading search results...'}
    getKey={item => `${item._index}-${item._id}`}
    renderItem={resultToPreview}
  />
)

const SearchResults = () => {
  const router = useRouter()

  const getTabIndexFromUrl = (): number => {
    const tabFromUrl = router.query.tab
    const tabIndex = panes.findIndex(pane => pane.key === tabFromUrl)
    return tabIndex < 0 ? 0 : tabIndex
  }

  const initialTabIndex = getTabIndexFromUrl()
  const initialTabKey = panes[initialTabIndex].key

  const [activeTabKey, setActiveTabKey] = useState(initialTabKey)

  const handleTabChange = (key: string) => {
    setActiveTabKey(key)

    const newPath = {
      pathname: router.pathname,
      query: {
        ...router.query,
        tab: key,
      },
    }

    router.push(newPath, newPath)
  }

  const { q, tabs, tags } = router.query

  const byTags = nonEmptyArr(tags) ? `${tags} tag(s)` : undefined
  const resultsName = q || byTags || 'all items'
  const title = `Search results for ${resultsName} in ${tabs}`

  return (
    <PageContent meta={{ title, tags: tags as string[] }}>
      <Tabs onChange={handleTabChange} activeKey={activeTabKey.toString()}>
        {panes.map(({ key, title }) => (
          <TabPane key={key} tab={title}>
            <AllResultsList />
          </TabPane>
        ))}
      </Tabs>
    </PageContent>
  )
}

export default SearchResults
