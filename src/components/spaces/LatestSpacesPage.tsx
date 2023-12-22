import { FC, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import config from 'src/config'
import { useDfApolloClient } from 'src/graphql/ApolloProvider'
import { GetLatestSpaceIds } from 'src/graphql/__generated__/GetLatestSpaceIds'
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

const { recommendedSpaceIds, creatorIds } = config

type Props = {
  initialSpaceIds?: SpaceId[]
  totalSpaceCount: number
  filter: SpaceFilterType
  dateFilter?: DateFilterType
}

const loadMoreSpacesFn = async (loadMoreValues: LoadMoreValues<SpaceFilterType>) => {
  const { client, size, page, myAddress, subsocial, dispatch, filter } = loadMoreValues

  if (filter === undefined) return []

  let spaceIds: string[] = []

  if (filter.type !== 'suggested' && filter.type !== 'creators' && client) {
    const offset = (page - 1) * size
    const data = await loadSpacesByQuery({
      client,
      offset,
      filter: { type: filter.type, date: filter.date },
    })

    const { spaces } = data as GetLatestSpaceIds
    spaceIds = spaces.map(value => value.id)
  } else {
    if (filter.type === 'creators') spaceIds = getPageOfIds(creatorIds ?? [], { page, size })
    else spaceIds = getPageOfIds(recommendedSpaceIds, { page, size })
  }

  console.log(spaceIds, filter)

  await Promise.all([
    dispatch(fetchMyPermissionsBySpaceIds({ api: subsocial, ids: spaceIds, myAddress })),
    dispatch(fetchSpaces({ api: subsocial, ids: spaceIds, dataSource: DataSourceTypes.SQUID })),
  ])

  return spaceIds
}

const InfiniteListOfSpaces = (props: Props) => {
  const { totalSpaceCount, initialSpaceIds, filter, dateFilter } = props
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
    })
  }

  const List = useCallback(
    () => (
      <InfinitePageList
        loadingLabel='Loading more spaces...'
        dataSource={initialSpaceIds}
        loadMore={loadMore}
        totalCount={totalSpaceCount}
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

export const CreatorsSpaces = () => (
  <InfiniteListOfSpaces totalSpaceCount={creatorIds?.length ?? 0} filter='creators' />
)

export default LatestSpacesPage
