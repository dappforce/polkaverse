import clsx from 'clsx'
import { ComponentProps } from 'react'
import CreatePostCard from './cards/CreatePostCard'
import CreatorInfoCard from './cards/CreatorInfoCard'
import GetMoreSubCard from './cards/GetMoreSubCard'
import MyStakeCard from './cards/MyStakeCard'
import StakeSubCard from './cards/StakeSubCard'
import SupportCreatorsCard from './cards/SupportCreatorCard'

export type CreatorDashboardHomeVariant = 'posts' | 'spaces'
export type CreatorDashboardSidebarType =
  | { name: 'home-page'; variant: CreatorDashboardHomeVariant }
  | { name: 'space-page'; spaceId: string }
  | { name: 'post-page'; authorAddress: string }

export type CreatorDashboardSidebarProps = ComponentProps<'div'> & {
  dashboardType: CreatorDashboardSidebarType
}

export default function CreatorDashboardSidebar({
  dashboardType,
  ...props
}: CreatorDashboardSidebarProps) {
  if (dashboardType.name === 'home-page') {
    return <HomePageSidebar {...dashboardType} />
  }

  return (
    <div {...props} className={clsx('d-flex flex-column GapNormal', props.className)}>
      {dashboardType && (
        <>
          <CreatorInfoCard />
          <MyStakeCard />
          <GetMoreSubCard />
          <StakeSubCard />
          <SupportCreatorsCard />
        </>
      )}
    </div>
  )
}

function HomePageSidebar({ variant }: Extract<CreatorDashboardSidebarType, { name: 'home-page' }>) {
  return <CreatePostCard variant={variant} />
}
