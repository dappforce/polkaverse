import { SpaceData } from '@subsocial/api/types'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { useMyAddress } from '../auth/MyAccountsContext'
import CreatePostCard from './cards/CreatePostCard'
import CreatorInfoCard from './cards/CreatorInfoCard'
import SupportCreatorsCard from './cards/SupportCreatorsCard'
import RewardInfoCard from './rewards/RewardInfoCard'

export type CreatorDashboardHomeVariant = 'posts' | 'spaces'
export type CreatorDashboardSidebarType =
  | { name: 'home-page'; variant: CreatorDashboardHomeVariant }
  | { name: 'space-page' }
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
  const myAddress = useMyAddress() ?? ''
  const { loading, data: totalStake } = useFetchTotalStake(myAddress)

  if (loading) return null

  return (
    <>
      {totalStake?.hasStakedEnough && <CreatePostCard variant={variant} />}
      <SupportCreatorsCard />
      {totalStake?.hasStakedEnough && <RewardInfoCard />}
    </>
  )
}

function SpacePageSidebar({}: Extract<CreatorDashboardSidebarType, { name: 'space-page' }>) {
  const myAddress = useMyAddress() ?? ''
  const { data: totalStake, loading: loadingTotalStake } = useFetchTotalStake(myAddress)

  if (loadingTotalStake) return null

  const renderTopCard = () => {
    if (!totalStake?.hasStakedEnough) return <SupportCreatorsCard />
    return null
  }

  return (
    <>
      {renderTopCard()}
      {totalStake?.hasStakedEnough && <RewardInfoCard />}
    </>
  )
}

function PostPageSidebar({ space }: Extract<CreatorDashboardSidebarType, { name: 'post-page' }>) {
  const myAddress = useMyAddress() ?? ''
  const { data, loading: loadingTotalStake } = useFetchTotalStake(myAddress)

  return (
    <>
      <CreatorInfoCard space={space} />
      {!loadingTotalStake && (data?.hasStakedEnough ? <RewardInfoCard /> : <SupportCreatorsCard />)}
    </>
  )
}
