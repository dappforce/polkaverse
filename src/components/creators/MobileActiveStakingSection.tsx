import { ComponentProps } from 'react'
import { useIsMobileWidthOrDevice } from '../responsive'
import MiniLeaderboardCard from './MiniLeaderboardCard'
import MobileRewardDashboard from './MobileRewardDashboard'

export type MobileActiveStakingSectionProps = ComponentProps<'div'> & {
  offsetX?: number
  offsetY?: number
  showMiniLeaderboard?: boolean
}

export default function MobileActiveStakingSection({
  offsetX = -16,
  offsetY = -12,
  showMiniLeaderboard = true,
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
          zIndex: 9,
          background: 'white',
          ...props.style,
        }}
      >
        <MobileRewardDashboard />
      </div>
      {showMiniLeaderboard && (
        <MiniLeaderboardCard style={{ margin: `0 ${offsetX}px`, background: 'white' }} />
      )}
    </>
  )
}
