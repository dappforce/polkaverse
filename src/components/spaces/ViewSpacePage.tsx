import { FC, useEffect } from 'react'
import config from 'src/config'
import { initializeApollo } from 'src/graphql/client'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchPostRewards } from 'src/rtk/features/activeStaking/postRewardSlice'
import { useIsBlocked } from 'src/rtk/features/moderation/hooks'
import { useFetchMyPermissionsBySpaceId } from 'src/rtk/features/permissions/mySpacePermissionsHooks'
import { fetchPosts, fetchProfilePosts, selectPosts } from 'src/rtk/features/posts/postsSlice'
import { fetchPostsViewCount } from 'src/rtk/features/posts/postsViewCountSlice'
import { fetchProfileSpace, selectProfileSpace } from 'src/rtk/features/profiles/profilesSlice'
import { DataSourceTypes, HasStatusCode, idToBn, PostStruct, SpaceContent } from 'src/types'
import { descSort, isPolkaProject, isUnclaimedSpace } from 'src/utils'
import { useMyAddress } from '../auth/MyAccountsContext'
import { PageContent } from '../main/PageWrapper'
import BlockedAlert from '../moderation/BlockedAlert'
import { spaceUrl } from '../urls'
import { ClaimSpaceBanner } from '../utils/banners/ClaimSpaceBanner'
import { getPageOfIds } from '../utils/getIds'
import { return404 } from '../utils/next'
import { SpaceNotFountPage, useIsUnlistedSpace } from './helpers'
import { loadSpaceOnNextReq } from './helpers/loadSpaceOnNextReq'
import { ViewSpace } from './ViewSpace'
import { ViewSpaceProps } from './ViewSpaceProps'

type Props = ViewSpaceProps &
  HasStatusCode & {
    customImage?: string
    isProfileSpace?: boolean
  }

const InnerViewSpacePage: FC<Props> = props => {
  const myAddress = useMyAddress()
  const { spaceData, customImage, isProfileSpace } = props
  const { isBlocked: isOwnerBlocked, loading } = useIsBlocked(spaceData?.struct.ownerId ?? '')

  useFetchMyPermissionsBySpaceId(spaceData?.id)

  if (useIsUnlistedSpace(spaceData) || !spaceData) {
    return <SpaceNotFountPage />
  }

  const id = idToBn(spaceData.struct.id)
  const { name, image } = (spaceData.content as SpaceContent | undefined) || {}

  // We add this to a title to improve SEO of Polkadot projects.
  const title = name
    ? name + (isPolkaProject(id) ? ' - Polkadot ecosystem projects' : '')
    : config.metaTags.title

  const { ownerId } = spaceData.struct

  const showBanner = isUnclaimedSpace(spaceData.struct) && myAddress !== ownerId

  return (
    <>
      <PageContent
        meta={{
          title,
          desc: `Latest news and updates from ${name} on ${config.appName}`,
          image: customImage || image,
          canonical: spaceUrl(spaceData.struct),
        }}
        withSidebar
        withVoteBanner
        creatorDashboardSidebarType={{ name: 'space-page' }}
      >
        {!loading && isOwnerBlocked && isProfileSpace && (
          <BlockedAlert customPrefix='The owner of this space' />
        )}
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

const ViewSpacePage: FC<Props & { prefetchedIds: string[] }> = props => {
  const { statusCode, prefetchedIds } = props
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchPostRewards({ postIds: prefetchedIds }))
    dispatch(fetchPostsViewCount({ postIds: prefetchedIds }))
  }, [dispatch])

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

  let pageIds: string[] = []
  let sortedPostIds: string[] = []

  // We need to reverse post ids to display posts in a descending order on a space page.

  const customImage = query.customImage as string | undefined

  await dispatch(fetchProfileSpace({ id: data.struct.ownerId, api: subsocial }))
  const profile = selectProfileSpace(reduxStore.getState(), data.struct.ownerId)
  const isProfileSpace = profile?.spaceId === data.id

  let initialApolloState: any = undefined
  const client = initializeApollo(null, true)
  if (isProfileSpace && client) {
    const result = await dispatch(
      fetchProfilePosts({
        id: data.struct.ownerId,
        spaceId: data.id,
        withHidden: isProfileSpace,
        client,
        api: subsocial,
        limit: 20,
        offset: 0,
        dispatch,
      }),
    )

    const posts = result.payload as PostStruct[]

    const postIds = posts?.map(p => p.id) || []

    sortedPostIds = descSort(postIds)

    pageIds = getPageOfIds(sortedPostIds, query)

    initialApolloState = client.extract()
  } else {
    const postIds = await subsocial.blockchain.postIdsBySpaceId(spaceId)

    sortedPostIds = descSort(postIds)

    pageIds = getPageOfIds(sortedPostIds, query)

    await dispatch(
      fetchPosts({
        api: subsocial,
        ids: pageIds,
        reload: true,
        eagerLoadHandles: true,
        dataSource: DataSourceTypes.SQUID,
      }),
    )
  }

  const posts = selectPosts(reduxStore.getState(), { ids: pageIds })

  return {
    initialApolloState,
    spaceData: data,
    posts,
    postIds: sortedPostIds,
    prefetchedIds: pageIds,
    customImage,
    isProfileSpace,
  }
})

export default ViewSpacePage
