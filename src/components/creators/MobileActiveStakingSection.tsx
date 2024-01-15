import { ComponentProps } from 'react'
import { useIsMobileWidthOrDevice } from '../responsive'
import MobileStakerRewardDashboard from './MobileStakerRewardDashboard'
import TopMembersCard from './TopMembersCard'

export type MobileActiveStakingSectionProps = ComponentProps<'div'>

export default function MobileActiveStakingSection({ ...props }: MobileActiveStakingSectionProps) {
  const isMobile = useIsMobileWidthOrDevice()
  if (!isMobile) return null

  return (
    <div
      {...props}
      style={{
        margin: '-12px -16px 0',
        position: 'sticky',
        top: '64px',
        zIndex: 10,
        background: 'white',
        ...props.style,
      }}
    >
      <MobileStakerRewardDashboard />
      <TopMembersCard />
    </div>
  )
}
