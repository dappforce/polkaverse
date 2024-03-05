import { useIsMyAddress } from 'src/components/auth/MyAccountsContext'
import { PageContent } from 'src/components/main/PageWrapper'
import { OwnedSpacesList } from 'src/components/spaces/AccountSpaces'
import { CreateSpaceButton } from 'src/components/spaces/helpers'
import { toShortAddress } from 'src/components/utils'
import { return404 } from 'src/components/utils/next'
import Section from 'src/components/utils/Section'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { fetchSpaceIdsOwnedByAccount } from 'src/rtk/features/spaceIds/ownSpaceIdsSlice'
import { fetchSpaceIdsWithRolesByAccount } from 'src/rtk/features/spaceIds/spaceIdsWithRolesByAccountSlice'

const OwnedSpacesPage = ({ address }: { address: string }) => {
  const isMy = useIsMyAddress(address ?? '')

  if (!address) return null

  const title = (
    <span className='d-flex justify-content-between align-items-center w-100 my-2'>
      <span>{isMy ? 'My spaces' : `Spaces of ${toShortAddress(address)}`}</span>
      {isMy && <CreateSpaceButton />}
    </span>
  )

  return (
    <PageContent
      creatorDashboardSidebarType={{ name: 'home-page', variant: 'posts' }}
      meta={{
        title: 'Account spaces',
        desc: `Subsocial spaces owned by ${address}`,
      }}
      withSidebar
    >
      <Section className='m-0' title={title}>
        <OwnedSpacesList address={address} />
      </Section>
    </PageContent>
  )
}
getInitialPropsWithRedux(OwnedSpacesPage, async ({ subsocial, dispatch, context }) => {
  console.log(context)
  const address = context.query?.address as string | undefined
  console.log(address)
  if (!address) return return404(context)

  await Promise.all([
    dispatch(fetchSpaceIdsWithRolesByAccount({ id: address, reload: true, api: subsocial })),
    dispatch(fetchSpaceIdsOwnedByAccount({ id: address, reload: true, api: subsocial })),
  ])

  return { address }
})
export default OwnedSpacesPage
