import { ComponentProps } from 'react'
import config from 'src/config'
import { useIsMobileWidthOrDevice } from '../responsive'
import MobileRewardDashboard from './MobileRewardDashboard'
import TopUsersCard from './TopUsersCard'

export type MobileActiveStakingSectionProps = ComponentProps<'div'> & {
  offsetX?: number
  offsetY?: number
  showTopUsers?: boolean
}

export default function MobileActiveStakingSection({
  offsetX = -16,
  offsetY = -12,
  showTopUsers = true,
  ...props
}: MobileActiveStakingSectionProps) {
  const isMobile = useIsMobileWidthOrDevice()
  if (!isMobile || !config.enableDatahub) return null

  return (
    <>
      <div
        {...props}
        style={{
          margin: `${offsetY}px ${offsetX}px 0`,
          position: 'sticky',
          top: '64px',
          zIndex: 9,
          background: 'white',
          ...props.style,
        }}
      >
        <MobileRewardDashboard />
      </div>
      {showTopUsers && <TopUsersCard style={{ margin: `0 ${offsetX}px`, background: 'white' }} />}
    </>
  )
}
