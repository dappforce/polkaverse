import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchMyPermissionsBySpaceIds } from 'src/rtk/features/permissions/mySpacePermissionsSlice'
import { fetchSpaces } from 'src/rtk/features/spaces/spacesSlice'
import { reservedPolkadotSpaceIds } from 'src/utils'
import { useMyAddress } from '../auth/MyAccountsContext'
import { InfiniteListByPage, InnerLoadMoreFn } from '../lists'
import { PageContent } from '../main/PageWrapper'
import { getPageOfIds } from '../utils/getIds'
import { PublicSpacePreviewById } from './SpacePreview'

const title = 'Unclaimed spaces'

export const UnclaimedSpacesList = () => {
  const allSpaceIds = reservedPolkadotSpaceIds
  const dispatch = useAppDispatch()
  const { subsocial, isApiReady } = useSubsocialApi()
  const myAddress = useMyAddress()

  const loadMore: InnerLoadMoreFn = async (page, size) => {
    if (!isApiReady) return []
    const spaceIds = getPageOfIds(allSpaceIds, { page, size })

    await Promise.all([
      dispatch(fetchMyPermissionsBySpaceIds({ api: subsocial, ids: spaceIds, myAddress })),
      dispatch(fetchSpaces({ api: subsocial, ids: spaceIds })),
    ])

    return spaceIds
  }

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <InfiniteListByPage
        title={title}
        loadMore={loadMore}
        loadingLabel='Loading spaces...'
        totalCount={allSpaceIds.length}
        noDataDesc='There are no spaces yet'
        getKey={spaceId => spaceId}
        renderItem={spaceId => <PublicSpacePreviewById spaceId={spaceId} />}
      />
    </div>
  )
}

const UnclaimedSpacesListPage = () => {
  return (
    <PageContent
      meta={{
        title,
        desc: 'Only unclaimed spaces of polka',
      }}
      withSidebar
    >
      <UnclaimedSpacesList />
    </PageContent>
  )
}

export default UnclaimedSpacesListPage
