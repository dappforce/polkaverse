import Link from 'next/link'
import { FC } from 'react'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { useFetchSpacesWithMyPermissions } from 'src/rtk/features/spaces/spacesHooks'
import { fetchSpaces, selectSpaces } from 'src/rtk/features/spaces/spacesSlice'
import { SpaceId } from 'src/types'
import { isUnclaimedSpace, reservedPolkadotSpaceIds } from 'src/utils'
import { PaginatedList } from '../lists/PaginatedList'
import { PageContent } from '../main/PageWrapper'
import { LoadingSpaces } from '../utils'
import { getPageOfIds } from '../utils/getIds'
import { PublicSpacePreviewById } from './SpacePreview'
import styles from './spaces.module.sass'

const title = 'Unclaimed spaces'

type Props = {
  spaceIds: SpaceId[]
  totalSpaceCount?: number
}

export const UnclaimedSpacesList = (props: Props) => {
  const { spaceIds, totalSpaceCount = 0 } = props

  const { loading } = useFetchSpacesWithMyPermissions(spaceIds)

  if (loading) return <LoadingSpaces />

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <PaginatedList
        totalCount={totalSpaceCount}
        dataSource={spaceIds}
        noDataDesc='There are no spaces yet'
        getKey={spaceId => spaceId}
        renderItem={spaceId => <PublicSpacePreviewById spaceId={spaceId} />}
      />
    </div>
  )
}

const UnclaimedSpacesListPage: FC<Props> = props => {
  return (
    <PageContent
      meta={{
        title,
        desc: 'Only unclaimed spaces of Polkadot projects',
      }}
      title={title}
      withSidebar
    >
      <div className={styles.ClaimMessage}>
        <p>
          These spaces have been reserved for teams building Web 3 projects in the Polkadot and
          Kusama ecosystems.
        </p>
        <p>
          If you are one of these projects, please send{' '}
          <a href='https://twitter.com/SubsocialChain' target='_blank' rel='noreferrer'>
            @SubsocialChain
          </a>{' '}
          a DM from your project&apos;s official Twitter account. Otherwise, you can create your own
          space{' '}
          <Link href='/spaces/new' as='/spaces/new'>
            here
          </Link>
          .
        </p>
        <UnclaimedSpacesList {...props} />
      </div>
    </PageContent>
  )
}

getInitialPropsWithRedux(
  UnclaimedSpacesListPage,
  async ({ context, subsocial, dispatch, reduxStore }) => {
    const { query } = context
    const pageSpaceIds = getPageOfIds(reservedPolkadotSpaceIds, query)

    // TODO fetch only public spaces!
    await dispatch(
      fetchSpaces({
        api: subsocial,
        ids: pageSpaceIds,
        reload: true,
        eagerLoadHandles: true /* TODO visibility: 'public' */,
      }),
    )

    const spaces = selectSpaces(reduxStore.getState(), { ids: pageSpaceIds })

    const spaceIds = spaces
      .filter(({ struct }) => isUnclaimedSpace(struct))
      .map(({ struct }) => struct.id)
    const totalSpaceCount = reservedPolkadotSpaceIds.length

    return { spaceIds, totalSpaceCount }
  },
)

export default UnclaimedSpacesListPage
