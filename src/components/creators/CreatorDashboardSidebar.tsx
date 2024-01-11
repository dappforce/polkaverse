import { SpaceData } from '@subsocial/api/types'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { useIsCreatorSpace } from 'src/rtk/features/creators/creatorsListHooks'
import { useFetchStakeData } from 'src/rtk/features/creators/stakesHooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { useMyAddress } from '../auth/MyAccountsContext'
import CreatePostCard from './cards/CreatePostCard'
import CreatorInfoCard from './cards/CreatorInfoCard'
import MyStakeCard from './cards/MyStakeCard'
import StakeSubCard from './cards/StakeSubCard'
import SupportCreatorsCard from './cards/SupportCreatorsCard'
import CreatorRewardInfoCard from './creator-rewards/CreatorRewardInfoCard'
import StakerRewardInfoCard from './staker-rewards/StakerRewardInfoCard'

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
  const myAddress = useMyAddress() ?? ''
  const { data, loading } = useFetchTotalStake(myAddress)

  if (loading) return null

  return (
    <>
      {data?.hasStaked ? (
        <>
          <CreatePostCard variant={variant} />
          <StakerRewardInfoCard />
        </>
      ) : (
        <SupportCreatorsCard />
      )}
      <CreatorRewardInfoCard />
    </>
  )
}

function SpacePageSidebar({ space }: Extract<CreatorDashboardSidebarType, { name: 'space-page' }>) {
  const myAddress = useMyAddress() ?? ''
  const { data: stakeData, loading: loadingStakeData } = useFetchStakeData(myAddress, space.id)
  const { isCreatorSpace, loading: loadingIsCreator } = useIsCreatorSpace(space.id)
  const { data: totalStake, loading: loadingTotalStake } = useFetchTotalStake(myAddress)

  if (loadingIsCreator || loadingStakeData) {
    return null
  }

  const renderTopCard = () => {
    if (!isCreatorSpace) {
      if (!totalStake?.hasStaked) return <SupportCreatorsCard />
      return null
    }

    if (stakeData?.hasStaked) return <MyStakeCard space={space} />
    else return <StakeSubCard space={space} />
  }

  return (
    <>
      {renderTopCard()}
      {!loadingTotalStake && totalStake?.hasStaked && <StakerRewardInfoCard />}
      <CreatorRewardInfoCard />
    </>
  )
}

function PostPageSidebar({ space }: Extract<CreatorDashboardSidebarType, { name: 'post-page' }>) {
  const myAddress = useMyAddress() ?? ''
  const { data, loading: loadingTotalStake } = useFetchTotalStake(myAddress)
  const { loading: loadingCreator } = useIsCreatorSpace(space.id)

  if (loadingCreator) {
    return null
  }

  return (
    <>
      <CreatorInfoCard showStakeButton={data?.hasStaked} space={space} />
      {!loadingTotalStake &&
        (data?.hasStaked ? <StakerRewardInfoCard /> : <StakeSubCard space={space} />)}
      <CreatorRewardInfoCard />
    </>
  )
}
