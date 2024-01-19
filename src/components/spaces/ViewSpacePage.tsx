import { FC } from 'react'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { fetchTopUsersWithSpaces } from 'src/rtk/features/leaderboard/topUsersSlice'
import { useFetchMyPermissionsBySpaceId } from 'src/rtk/features/permissions/mySpacePermissionsHooks'
import { fetchPosts, selectPosts } from 'src/rtk/features/posts/postsSlice'
import { DataSourceTypes, HasStatusCode, idToBn, SpaceContent } from 'src/types'
import { descSort, isPolkaProject, isUnclaimedSpace } from 'src/utils'
import { useMyAddress } from '../auth/MyAccountsContext'
import { PageContent } from '../main/PageWrapper'
import { spaceUrl } from '../urls'
import { ClaimSpaceBanner } from '../utils/banners/ClaimSpaceBanner'
import { getPageOfIds } from '../utils/getIds'
import { return404 } from '../utils/next'
import { SpaceNotFountPage, useIsUnlistedSpace } from './helpers'
import { loadSpaceOnNextReq } from './helpers/loadSpaceOnNextReq'
import { ViewSpace } from './ViewSpace'
import { ViewSpaceProps } from './ViewSpaceProps'

type Props = ViewSpaceProps & HasStatusCode

const InnerViewSpacePage: FC<Props> = props => {
  const myAddress = useMyAddress()
  const { spaceData } = props

  useFetchMyPermissionsBySpaceId(spaceData?.id)

  if (useIsUnlistedSpace(spaceData) || !spaceData) {
    return <SpaceNotFountPage />
  }

  // if (loading && isClientSide()) return <Loading label='Loading space...' center />.

  const id = idToBn(spaceData.struct.id)
  const { name, image } = spaceData.content as SpaceContent

  // We add this to a title to improve SEO of Polkadot projects.
  const title = name + (isPolkaProject(id) ? ' - Polkadot ecosystem projects' : '')

  const { ownerId } = spaceData.struct

  const showBanner = isUnclaimedSpace(spaceData.struct) && myAddress !== ownerId

  return (
    <>
      <PageContent
        meta={{
          title,
          desc: `Latest news and updates from ${name} on Polkaverse.`,
          image,
          canonical: spaceUrl(spaceData.struct),
        }}
        withSidebar
        withVoteBanner
        creatorDashboardSidebarType={{ name: 'space-page', space: spaceData }}
      >
        {showBanner && (
          <ClaimSpaceBanner
            title='Are you the owner of this project?'
            desc='You can claim ownership for free!'
          />
        )}
        <ViewSpace {...props} />
      </PageContent>
    </>
  )
}

const ViewSpacePage: FC<Props> = props => {
  const { statusCode } = props
  if (statusCode === 404) {
    return <SpaceNotFountPage />
  }

  return <InnerViewSpacePage {...props} />
}

getInitialPropsWithRedux(ViewSpacePage, async props => {
  const { context, subsocial, dispatch, reduxStore } = props
  const { query } = context

  const data = await loadSpaceOnNextReq(props, spaceUrl)

  if (data?.statusCode === 404) return return404(context)

  const spaceId = idToBn(data.id)

  // We need to reverse post ids to display posts in a descending order on a space page.
  const postIds = await subsocial.blockchain.postIdsBySpaceId(spaceId)

  const sortedPostIds = descSort(postIds)

  const pageIds = getPageOfIds(sortedPostIds, query)

  await Promise.all([
    dispatch(
      fetchPosts({
        api: subsocial,
        ids: pageIds,
        reload: true,
        eagerLoadHandles: true,
        dataSource: DataSourceTypes.SQUID,
      }),
    ),
    fetchTopUsersWithSpaces(dispatch, subsocial),
  ])

  const posts = selectPosts(reduxStore.getState(), { ids: pageIds })

  return {
    spaceData: data,
    posts,
    postIds: sortedPostIds,
  }
})

export default ViewSpacePage
