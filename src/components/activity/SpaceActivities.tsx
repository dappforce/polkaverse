import config from 'src/config'
import { useGetSpaceActivities } from 'src/graphql/hooks'
import { fetchSpaces } from 'src/rtk/features/spaces/spacesSlice'
import { DataSourceTypes, PostId, SpaceId } from 'src/types'
import { PublicSpacePreviewById } from '../spaces/SpacePreview'
import { getPageOfIds } from '../utils/getIds'
import { InnerActivities } from './InnerActivities'
import { BaseActivityProps, LoadMoreFn, LoadMoreProps } from './types'

export const offchainLoadMoreSpaces =
  (getData: LoadMoreFn<string>) =>
  async (props: LoadMoreProps): Promise<PostId[]> => {
    const { subsocial, dispatch, address, page, size } = props

    if (!address) return []

    const offset = (page - 1) * size
    const spaceIds = (await getData({ address, offset, limit: size })) || []

    await dispatch(
      fetchSpaces({ api: subsocial, ids: spaceIds, dataSource: DataSourceTypes.SQUID }),
    )
    return spaceIds
  }

export const onchainLoadMoreSpaces = async (props: LoadMoreProps): Promise<PostId[]> => {
  const { subsocial, dispatch, address, page, size, ids = [] } = props

  if (!address) return []

  const spaceIds = await getPageOfIds(ids, { page, size })
  await dispatch(fetchSpaces({ api: subsocial, ids: spaceIds }))

  return spaceIds
}

export const SpaceActivities = (props: BaseActivityProps) => {
  const getSpaceActivities = useGetSpaceActivities()

  const loadMoreFn = config.enableOnchainActivities
    ? onchainLoadMoreSpaces
    : offchainLoadMoreSpaces(getSpaceActivities)

  return (
    <InnerActivities
      {...props}
      loadMore={loadMoreFn}
      noDataDesc='No spaces yet'
      loadingLabel='Loading spaces...'
      getKey={spaceId => spaceId}
      renderItem={(spaceId: SpaceId) => <PublicSpacePreviewById spaceId={spaceId} />}
    />
  )
}
