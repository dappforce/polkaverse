import { ComponentProps } from 'react'
import { useIsMobileWidthOrDevice } from '../responsive'
import MobileStakerRewardDashboard from './MobileStakerRewardDashboard'
import TopUsersCard from './TopUsersCard'

export type MobileActiveStakingSectionProps = ComponentProps<'div'> & {
  offsetX?: number
  offsetY?: number
}

export default function MobileActiveStakingSection({
  offsetX = -16,
  offsetY = -12,
  ...props
}: MobileActiveStakingSectionProps) {
  const isMobile = useIsMobileWidthOrDevice()
  if (!isMobile) return null

  return (
    <>
      <div
        {...props}
        style={{
          margin: `${offsetY}px ${offsetX}px 0`,
          position: 'sticky',
          top: '64px',
          zIndex: 10,
          background: 'white',
          ...props.style,
        }}
      >
        <MobileStakerRewardDashboard />
      </div>
      <TopUsersCard style={{ margin: `0 ${offsetX}px`, background: 'white' }} />
    </>
  )
}
