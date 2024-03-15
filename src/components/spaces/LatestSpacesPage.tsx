import shuffle from 'lodash.shuffle'
import { FC, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import config from 'src/config'
import { useDfApolloClient } from 'src/graphql/ApolloProvider'
import { GetLatestSpaceIds } from 'src/graphql/__generated__/GetLatestSpaceIds'
import { useAppDispatch } from 'src/rtk/app/store'
import { useFetchCreators } from 'src/rtk/features/creators/creatorsListHooks'
import { fetchCreators } from 'src/rtk/features/creators/creatorsListSlice'
import { fetchMyPermissionsBySpaceIds } from 'src/rtk/features/permissions/mySpacePermissionsSlice'
import { DataSourceTypes, SpaceId } from 'src/types'
import { fetchSpaces } from '../../rtk/features/spaces/spacesSlice'
import { useMyAddress } from '../auth/MyAccountsContext'
import { InnerLoadMoreFn } from '../lists'
import { InfinitePageList } from '../lists/InfiniteList'
import { DateFilterType, LoadMoreValues, SpaceFilterType } from '../main/types'
import { isSuggested, loadSpacesByQuery } from '../main/utils'
import { getPageOfIds } from '../utils/getIds'
import { PublicSpacePreviewById } from './SpacePreview'

const { recommendedSpaceIds } = config

type Props = {
  spaceIds?: SpaceId[]
  initialSpaceIds?: SpaceId[]
  customFetcher?: (config: LoadMoreValues<SpaceFilterType>) => Promise<string[]>
  totalSpaceCount?: number
  filter: SpaceFilterType
  dateFilter?: DateFilterType
  className?: string
}

const loadMoreSpacesFn = async (
  loadMoreValues: LoadMoreValues<SpaceFilterType> & {
    customFetcher?: (config: LoadMoreValues<SpaceFilterType>) => Promise<string[]>
  },
) => {
  const { client, size, page, myAddress, subsocial, dispatch, filter, customFetcher } =
    loadMoreValues

  if (filter === undefined) return []

  let spaceIds: string[] = []

  if (customFetcher) {
    spaceIds = await customFetcher(loadMoreValues)
  } else {
    if (filter.type !== 'suggested' && client) {
      const offset = (page - 1) * size
      const data = await loadSpacesByQuery({
        client,
        offset,
        filter: { type: filter.type, date: filter.date },
      })

      const { spaces } = data as GetLatestSpaceIds
      spaceIds = spaces.map(value => value.id)
    } else {
      spaceIds = getPageOfIds(recommendedSpaceIds, { page, size })
    }
  }

  await Promise.all([
    dispatch(fetchMyPermissionsBySpaceIds({ api: subsocial, ids: spaceIds, myAddress })),
    dispatch(fetchSpaces({ api: subsocial, ids: spaceIds, dataSource: DataSourceTypes.SQUID })),
  ])

  return spaceIds
}

const InfiniteListOfSpaces = (props: Props) => {
  const { totalSpaceCount, initialSpaceIds, filter, dateFilter, customFetcher, className } = props
  const client = useDfApolloClient()
  const dispatch = useDispatch()
  const { subsocial } = useSubsocialApi()
  const myAddress = useMyAddress()

  const loadMore: InnerLoadMoreFn = (page, size) => {
    return loadMoreSpacesFn({
      client,
      size,
      page,
      myAddress,
      subsocial,
      dispatch,
      filter: {
        type: filter,
        date: dateFilter,
      },
      customFetcher,
    })
  }

  const List = useCallback(
    () => (
      <InfinitePageList
        className={className}
        loadingLabel='Loading more spaces...'
        dataSource={initialSpaceIds}
        loadMore={loadMore}
        totalCount={totalSpaceCount || 0}
        noDataDesc='No spaces yet'
        getKey={spaceId => spaceId}
        renderItem={spaceId => <PublicSpacePreviewById spaceId={spaceId} />}
      />
    ),
    [filter, dateFilter],
  )

  return <List />
}

const LatestSpacesPage: FC<Props> = ({ totalSpaceCount, ...props }) => {
  if (isSuggested(props.filter)) {
    totalSpaceCount = recommendedSpaceIds.length
  }

  return <InfiniteListOfSpaces totalSpaceCount={totalSpaceCount} {...props} />
}

export const SuggestedSpaces = () => (
  <InfiniteListOfSpaces totalSpaceCount={recommendedSpaceIds.length} filter='suggested' />
)

let shuffledCreators: string[] | null = null
export const CreatorsSpaces = () => {
  const { data: creators } = useFetchCreators()

  const dispatch = useAppDispatch()
  const loadCreators = async () => {
    if (shuffledCreators) return shuffledCreators

    const res = await dispatch(fetchCreators({}))
    const spaceIds = (res.payload as { spaceId: string }[]).map(({ spaceId }) => spaceId)
    shuffledCreators = shuffle(spaceIds)
    return shuffledCreators
  }

  return (
    <InfiniteListOfSpaces
      totalSpaceCount={creators.length ?? 0}
      customFetcher={loadCreators}
      // filter is not used if customFetcher is provided, but this is needed to make the type works properly
      filter='suggested'
    />
  )
}

export default LatestSpacesPage
