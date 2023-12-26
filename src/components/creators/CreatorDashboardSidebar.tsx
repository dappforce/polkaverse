import { SpaceData } from '@subsocial/api/types'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import config from 'src/config'
import { useFetchStakeData } from 'src/rtk/features/stakes/stakesHooks'
import { useMyAddress } from '../auth/MyAccountsContext'
import CreatePostCard from './cards/CreatePostCard'
import CreatorInfoCard from './cards/CreatorInfoCard'
import GetMoreSubCard from './cards/GetMoreSubCard'
import MyStakeCard from './cards/MyStakeCard'
import StakeSubCard from './cards/StakeSubCard'
import SupportCreatorsCard from './cards/SupportCreatorsCard'

export type CreatorDashboardHomeVariant = 'posts' | 'spaces'
export type CreatorDashboardSidebarType =
  | { name: 'home-page'; variant: CreatorDashboardHomeVariant }
  | { name: 'space-page'; space: SpaceData }
  | { name: 'post-page'; space: SpaceData }

export type CreatorDashboardSidebarProps = ComponentProps<'div'> & {
  dashboardType: CreatorDashboardSidebarType
}

export default function CreatorDashboardSidebar({
  dashboardType,
  ...props
}: CreatorDashboardSidebarProps) {
  if (!dashboardType) return null

  let content: JSX.Element | null = null
  if (dashboardType.name === 'home-page') {
    content = <HomePageSidebar {...dashboardType} />
  } else if (dashboardType.name === 'space-page') {
    content = <SpacePageSidebar {...dashboardType} />
  } else if (dashboardType.name === 'post-page') {
    content = <PostPageSidebar {...dashboardType} />
  }

  return (
    <div {...props} className={clsx('d-flex flex-column GapNormal', props.className)}>
      {content}
    </div>
  )
}

function HomePageSidebar({ variant }: Extract<CreatorDashboardSidebarType, { name: 'home-page' }>) {
  return (
    <>
      <CreatePostCard variant={variant} />
      <SupportCreatorsCard />
    </>
  )
}

function SpacePageSidebar({ space }: Extract<CreatorDashboardSidebarType, { name: 'space-page' }>) {
  const myAddress = useMyAddress()
  const { data } = useFetchStakeData(myAddress ?? '', space.id)

  if (!config.creatorIds?.includes(space.id)) {
    return <SupportCreatorsCard />
  }

  return data?.hasStaked ? (
    <>
      <MyStakeCard space={space} />
      <GetMoreSubCard />
    </>
  ) : (
    <>
      <StakeSubCard space={space} />
    </>
  )
}

function PostPageSidebar({ space }: Extract<CreatorDashboardSidebarType, { name: 'post-page' }>) {
  const myAddress = useMyAddress()
  const { data, loading } = useFetchStakeData(myAddress ?? '', space.id)

  if (!config.creatorIds?.includes(space.id)) {
    return (
      <>
        <CreatePostCard variant='posts' />
        <GetMoreSubCard />
      </>
    )
  }

  return (
    <>
      <CreatorInfoCard space={space} />
      {loading ? null : data?.hasStaked ? <GetMoreSubCard /> : <StakeSubCard space={space} />}
    </>
  )
}
