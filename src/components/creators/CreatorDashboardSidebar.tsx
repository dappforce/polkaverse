import clsx from 'clsx'
import { ComponentProps } from 'react'
import CreatePostCard from './cards/CreatePostCard'
import CreatorInfoCard from './cards/CreatorInfoCard'
import GetMoreSubCard from './cards/GetMoreSubCard'
import MyStakeCard from './cards/MyStakeCard'
import StakeSubCard from './cards/StakeSubCard'
import SupportCreatorsCard from './cards/SupportCreatorCard'

export type CreatorDashboardSidebarProps = ComponentProps<'div'>

export default function CreatorDashboardSidebar({ ...props }: CreatorDashboardSidebarProps) {
  return (
    <div {...props} className={clsx('d-flex flex-column GapNormal', props.className)}>
      <CreatePostCard />
      <CreatorInfoCard />
      <MyStakeCard />
      <GetMoreSubCard />
      <StakeSubCard />
      <SupportCreatorsCard />
    </div>
  )
}
