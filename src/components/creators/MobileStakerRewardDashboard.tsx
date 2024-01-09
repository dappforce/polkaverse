import { Tooltip } from 'antd'
import clsx from 'clsx'
import Link from 'next/link'
import { ComponentProps, useState } from 'react'
import { HiChevronRight } from 'react-icons/hi2'
import { SlQuestion } from 'react-icons/sl'
import { CREATORS_CONSTANTS } from 'src/config/constants'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useFetchUserRewardReport } from 'src/rtk/features/activeStaking/hooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { getAmountRange } from 'src/utils/analytics'
import { getSubIdCreatorsLink } from 'src/utils/links'
import { useMyAddress } from '../auth/MyAccountsContext'
import styles from './MobileStakerRewardDashboard.module.sass'
import StakerRewardInfo, { StakerSuperLikeCount } from './stakers/StakerRewardInfo'
import StakerRewardProgressBar from './stakers/StakerRewardProgressBar'

export type MobileStakerRewardDashboardProps = ComponentProps<'div'>

export default function MobileStakerRewardDashboard(props: MobileStakerRewardDashboardProps) {
  const { data: rewardReport, loading } = useFetchUserRewardReport()
  const likesCount = rewardReport?.superLikesCount ?? 0

  if (loading) return null

  if (!likesCount) {
    return <StakeSubBanner {...props} />
  }
  return <StakerRewardDashboard {...props} />
}

function StakeSubBanner(props: MobileStakerRewardDashboardProps) {
  const sendEvent = useSendEvent()
  return (
    <div
      {...props}
      className={clsx(props.className, styles.MobileStakerRewardDashboard, styles.StakeSubBanner)}
    >
      <div className={clsx(styles.Summary)}>
        <div className={styles.Content}>
          <span className={clsx('d-flex GapTiny align-items-center')}>
            <span className='FontWeightSemibold'>Stake SUB and earn more</span>
          </span>
          <div className={clsx('d-flex align-items-center GapTiny')}>
            <Link passHref href={getSubIdCreatorsLink()}>
              <a
                className='FontWeightSemibold'
                target='_blank'
                onClick={() =>
                  sendEvent('astake_banner_add_stake', { eventSource: 'mobile-staker-banner' })
                }
              >
                Stake SUB
              </a>
            </Link>
          </div>
        </div>
        <div className={clsx(styles.Gradient)} />
      </div>
    </div>
  )
}

function StakerRewardDashboard(props: MobileStakerRewardDashboardProps) {
  const sendEvent = useSendEvent()
  const { data: rewardReport } = useFetchUserRewardReport()
  const likesCount = rewardReport?.superLikesCount ?? 0
  const likesToMaxReward = CREATORS_CONSTANTS.SUPER_LIKES_FOR_MAX_REWARD - likesCount

  const [isOpen, setIsOpen] = useState(false)
  const myAddress = useMyAddress()
  const { data } = useFetchTotalStake(myAddress ?? '')
  if (!data?.hasStaked) return null

  const isOpenClassName = isOpen && styles.IsOpen

  return (
    <div {...props} className={clsx(props.className, styles.MobileStakerRewardDashboard)}>
      <div className={clsx(styles.Summary)}>
        <div className={styles.Content}>
          <span className={clsx('d-flex GapTiny align-items-center')}>
            <span className='FontWeightSemibold'>Extra SUB rewards</span>
            <Tooltip title={likesToMaxReward > 0 ? 'Daily Activity Target' : 'Daily Target Hit'}>
              <SlQuestion className='FontSmall ColorMuted' />
            </Tooltip>
          </span>
          <div className={clsx('d-flex align-items-center GapTiny')}>
            <div className={clsx('FontWeightSemibold', styles.CountProgress, isOpenClassName)}>
              <StakerSuperLikeCount />
            </div>
            <HiChevronRight
              onClick={() => {
                sendEvent('astake_dashboard_expanded', {
                  amountRange: getAmountRange(data.amount),
                })
                setIsOpen(prev => !prev)
              }}
              className={clsx('ColorMuted FontBig', styles.Arrow, isOpenClassName)}
            />
          </div>
        </div>
        <div className={styles.ProgressContainer}>
          <StakerRewardProgressBar size='small' />
        </div>
        <div className={clsx(styles.Gradient, isOpenClassName)} />
      </div>
      <div className={clsx(styles.RewardInfo, isOpenClassName)}>
        <StakerRewardInfo size='small' className='pt-1 position-relative' style={{ zIndex: 1 }} />
        <div className={clsx(styles.GradientOuter, isOpenClassName)} />
      </div>
    </div>
  )
}
