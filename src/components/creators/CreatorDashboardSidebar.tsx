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

function SpacePageSidebar({
  spaceId,
}: Extract<CreatorDashboardSidebarType, { name: 'space-page' }>) {
  const isStaked = true

  return isStaked ? (
    <>
      <MyStakeCard creatorSpaceId={spaceId} />
      <GetMoreSubCard />
    </>
  ) : (
    <>
      <StakeSubCard />
    </>
  )
}

function PostPageSidebar({}: // authorAddress,
Extract<CreatorDashboardSidebarType, { name: 'post-page' }>) {
  return (
    <>
      <CreatorInfoCard />
      <StakeSubCard />
    </>
  )
}
