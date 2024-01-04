import { Tooltip } from 'antd'
import clsx from 'clsx'
import { ComponentProps, useState } from 'react'
import { HiChevronRight } from 'react-icons/hi2'
import { RiHistoryFill } from 'react-icons/ri'
import { SlQuestion } from 'react-icons/sl'
import { CREATORS_CONSTANTS } from 'src/config/constants'
import { useFetchUserRewardReport } from 'src/rtk/features/activeStaking/hooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { useMyAddress } from '../auth/MyAccountsContext'
import styles from './MobileStakerRewardDashboard.module.sass'
import StakerRewardHistoryModal from './stakers/StakerRewardHistoryModal'
import StakerRewardInfo, { StakerSuperLikeCount } from './stakers/StakerRewardInfo'
import StakerRewardProgressBar from './stakers/StakerRewardProgressBar'

export type MobileStakerRewardDashboardProps = ComponentProps<'div'>

export default function MobileStakerRewardDashboard(props: MobileStakerRewardDashboardProps) {
  const [isOpenRewardHistoryModal, setIsOpenRewardHistoryModal] = useState(false)
  const { data: rewardReport } = useFetchUserRewardReport()
  const likesCount = rewardReport?.superLikesCount ?? 0
  const likesToMaxReward = CREATORS_CONSTANTS.SUPER_LIKES_FOR_MAX_REWARD - likesCount

  const [isOpen, setIsOpen] = useState(false)
  const myAddress = useMyAddress()
  const { data } = useFetchTotalStake(myAddress ?? '')
  if (!data?.hasStaked) return null

  const isOpenClassName = isOpen && styles.IsOpen

  return (
    <>
      <div {...props} className={clsx(props.className, styles.MobileStakerRewardDashboard)}>
        <div className={clsx(styles.Summary)}>
          <div className={styles.Content}>
            <span className={clsx('d-flex GapTiny align-items-center')}>
              <span className='FontWeightSemibold'>Extra SUB rewards</span>
              <Tooltip
                title={
                  likesToMaxReward > 0 ? `Like ${likesToMaxReward} more posts` : 'Goal achieved'
                }
              >
                <SlQuestion className='FontSmall ColorMuted' />
              </Tooltip>
            </span>
            <div className={clsx('d-flex align-items-center GapTiny')}>
              <div className={clsx('FontWeightSemibold', styles.CountProgress, isOpenClassName)}>
                <StakerSuperLikeCount />
              </div>
              <HiChevronRight
                onClick={() => setIsOpen(prev => !prev)}
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
          <StakerRewardInfo size='small' className='pt-1 pb-0' />
          <div
            className='pb-3 pt-2 px-3 d-flex justify-content-center align-items-center ColorPrimary FontWeightMedium GapMini'
            onClick={() => setIsOpenRewardHistoryModal(true)}
            style={{ cursor: 'pointer' }}
          >
            <RiHistoryFill />
            <span className='FontSmall'>Rewards History</span>
          </div>
          <div className={clsx(styles.GradientOuter, isOpenClassName)} />
        </div>
      </div>
      <StakerRewardHistoryModal
        visible={isOpenRewardHistoryModal}
        onCancel={() => setIsOpenRewardHistoryModal(false)}
      />
    </>
  )
}
