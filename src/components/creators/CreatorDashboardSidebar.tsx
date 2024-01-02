import { SpaceData } from '@subsocial/api/types'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { useIsCreatorSpace } from 'src/rtk/features/creators/creatorsListHooks'
import { useFetchStakeData } from 'src/rtk/features/creators/stakesHooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { useMyAddress } from '../auth/MyAccountsContext'
import CreatePostCard from './cards/CreatePostCard'
import CreatorInfoCard from './cards/CreatorInfoCard'
import GetMoreSubCard from './cards/GetMoreSubCard'
import MyStakeCard from './cards/MyStakeCard'
import StakerRewardInfoCard from './cards/StakerRewardInfoCard'
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
  const myAddress = useMyAddress() ?? ''
  const { data, loading } = useFetchTotalStake(myAddress)

  return (
    <>
      <CreatePostCard variant={variant} />
      {(() => {
        if (loading) return null
        if (data?.hasStaked) return <StakerRewardInfoCard />
        return <SupportCreatorsCard />
      })()}
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

  return (
    <>
      {(() => {
        if (!isCreatorSpace) return <SupportCreatorsCard />
        if (stakeData?.hasStaked) return <MyStakeCard space={space} />
        else return <StakeSubCard space={space} />
      })()}
      {!loadingTotalStake && totalStake?.hasStaked && <StakerRewardInfoCard />}
    </>
  )
}

function PostPageSidebar({ space }: Extract<CreatorDashboardSidebarType, { name: 'post-page' }>) {
  const myAddress = useMyAddress() ?? ''
  const { data, loading: loadingTotalStake } = useFetchTotalStake(myAddress)
  const { isCreatorSpace, loading: loadingCreator } = useIsCreatorSpace(space.id)

  if (loadingCreator) {
    return null
  }

  if (!isCreatorSpace) {
    return (
      <>
        <CreatePostCard variant='posts' />
        <GetMoreSubCard />
      </>
    )
  }

  return (
    <>
      {(() => {
        if (!isCreatorSpace) return <CreatePostCard variant='posts' />
        return <CreatorInfoCard showStakeButton={!data?.hasStaked} space={space} />
      })()}
      {!loadingTotalStake &&
        (data?.hasStaked ? <StakerRewardInfoCard /> : <StakeSubCard space={space} />)}
    </>
  )
}
